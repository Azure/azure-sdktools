import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MenuItem, TreeNode } from 'primeng/api';
import { Subject, takeUntil, tap } from 'rxjs';
import { getLanguageCssSafeName } from 'src/app/_helpers/component-helpers';
import { getQueryParams } from 'src/app/_helpers/router-helpers';
import { UserProfile } from 'src/app/_models/auth_service_models';
import { CommentItemModel, Review } from 'src/app/_models/review';
import { APIRevision, ApiTreeBuilderData, CodePanelRowData, CodePanelRowDatatype, CodePanelToggleableData, ReviewPageWorkerMessageDirective } from 'src/app/_models/revision';
import { AuthService } from 'src/app/_services/auth/auth.service';
import { ReviewsService } from 'src/app/_services/reviews/reviews.service';
import { RevisionsService } from 'src/app/_services/revisions/revisions.service';
import { UserProfileService } from 'src/app/_services/user-profile/user-profile.service';
import { WorkerService } from 'src/app/_services/worker/worker.service';
import { CodePanelComponent } from '../code-panel/code-panel.component';

@Component({
  selector: 'app-review-page',
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.scss']
})
export class ReviewPageComponent implements OnInit {
  @ViewChild(CodePanelComponent) codePanelComponent!: CodePanelComponent;

  reviewId : string | null = null;
  activeApiRevisionId : string | null = null;
  diffApiRevisionId : string | null = null;
  onlyDiff : boolean | null = null;

  userProfile : UserProfile | undefined;
  review : Review | undefined = undefined;
  apiRevisions: APIRevision[] = [];
  reviewComments : CommentItemModel[] | undefined = [];
  revisionSidePanel : boolean | undefined = undefined;
  reviewPageNavigation : TreeNode[] = [];
  language: string | undefined;
  languageSafeName: string | undefined;

  codeLinesDataBuffer: CodePanelRowData[] = [];
  otherCodePanelData: Map<string, CodePanelToggleableData> = new Map<string, CodePanelToggleableData>();
  onlyDiffBuffer: CodePanelRowData[] = [];
  codeLinesData: CodePanelRowData[] = [];
  apiRevisionPageSize = 50;
  lastNodeIdUnhashedDiscarded = '';

  private destroy$ = new Subject<void>();
  private destroyLoadAPIRevision$ : Subject<void>  | null = null;
  private destroyApiTreeBuilder$ : Subject<void>  | null = null;

  sideMenu: MenuItem[] | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private apiRevisionsService: RevisionsService,
    private reviewsService: ReviewsService, private workerService: WorkerService, private changeDeterctorRef: ChangeDetectorRef,
    private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.userProfileService.getUserProfile().subscribe(
      (userProfile : any) => {
        this.userProfile = userProfile;
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.updateStateBasedOnQueryParams(params);
    });

    this.reviewId = this.route.snapshot.paramMap.get('reviewId');
    this.activeApiRevisionId = this.route.snapshot.queryParamMap.get('activeApiRevisionId');
    this.diffApiRevisionId = this.route.snapshot.queryParamMap.get('diffApiRevisionId');
    this.onlyDiff = this.route.snapshot.queryParamMap.get('onlyDiff') === 'true';

    this.registerWorkerEventHandler();
    this.loadReview(this.reviewId!);
    this.loadAPIRevisions(0, this.apiRevisionPageSize);
    this.loadReviewContent(this.reviewId!, this.activeApiRevisionId, this.diffApiRevisionId);

    this.sideMenu = [
      {
          icon: 'bi bi-clock-history',
      },
      {
          icon: 'bi bi-file-diff'
      },
      {
          icon: 'bi bi-chat-left-dots'
      }
    ];
  }

  updateStateBasedOnQueryParams(params: Params) {
    this.activeApiRevisionId = params['activeApiRevisionId'];
    this.diffApiRevisionId = params['diffApiRevisionId'];
    this.onlyDiff = params['onlyDiff'] === 'true';
    this.reviewPageNavigation = [];
    this.codeLinesDataBuffer = [];
    this.otherCodePanelData = new Map<string, CodePanelToggleableData>();
    this.codeLinesData = [];
    this.changeDeterctorRef.detectChanges();
    this.workerService.startWorker().then(() => {
      this.registerWorkerEventHandler();
      this.loadReviewContent(this.reviewId!, this.activeApiRevisionId, this.diffApiRevisionId);
    });
  }

  registerWorkerEventHandler() {
    // Ensure existing subscription is destroyed
    this.destroyApiTreeBuilder$?.next();
    this.destroyApiTreeBuilder$?.complete();
    this.destroyApiTreeBuilder$ = new Subject<void>();

    this.workerService.onMessageFromApiTreeBuilder().pipe(takeUntil(this.destroyApiTreeBuilder$)).subscribe(data => {
      if (data.directive === ReviewPageWorkerMessageDirective.CreatePageNavigation) {
        this.reviewPageNavigation = data.navTree as TreeNode[];
      }

      if (data.directive === ReviewPageWorkerMessageDirective.InsertCodeLineData) {
        if (data.codePanelRowData.rowClasses.has("documentation")) {
          data.codePanelRowData.rowType = CodePanelRowDatatype.Documentation; // Specify that its a documentation row
          if (this.otherCodePanelData.has(data.codePanelRowData.nodeId)) {
            this.otherCodePanelData.get(data.codePanelRowData.nodeId)?.documentation.push(data.codePanelRowData);
          } else {
            this.otherCodePanelData.set(data.codePanelRowData.nodeId, {
              documentation: [data.codePanelRowData],
              diagnostics: [],
              comments: []
            });
          }
          if (this.userProfile?.preferences.showDocumentation) {
            this.codeLinesDataBuffer.push(data.codePanelRowData);
          }
        } else {
          if (this.onlyDiff!) {
            if (data.codePanelRowData.tokenPosition === 'bottom') {
              if (this.onlyDiffBuffer.length > 0) {
                // Remove all row for the current node from the buffer
                while (this.onlyDiffBuffer.length > 0 && this.onlyDiffBuffer[this.onlyDiffBuffer.length - 1].nodeIdUnHashed === data.codePanelRowData.nodeIdUnHashed) {
                  let node = this.onlyDiffBuffer.pop();
                  this.lastNodeIdUnhashedDiscarded = node!.nodeIdUnHashed!;
                }
              } else {
                if (this.lastNodeIdUnhashedDiscarded !== data.codePanelRowData.nodeIdUnHashed){
                  this.codeLinesDataBuffer.push(data.codePanelRowData);
                }
              }
            }
            else if (data.codePanelRowData.diffKind === 'Removed' || data.codePanelRowData.diffKind === 'Added') {
              while (this.onlyDiffBuffer.length > 0) {
                this.codeLinesDataBuffer.push(this.onlyDiffBuffer.shift()!); // Add everything in buffer to the main list
              }
              this.codeLinesDataBuffer.push(data.codePanelRowData);
            }
            else {
              this.onlyDiffBuffer.push(data.codePanelRowData);
            }
          } else {
            this.codeLinesDataBuffer.push(data.codePanelRowData);
          }
        }
      }

      if (data.directive === ReviewPageWorkerMessageDirective.InsertDiagnosticsRowData) {
        if (this.otherCodePanelData.has(data.codePanelRowData.nodeId)) {
          this.otherCodePanelData.get(data.codePanelRowData.nodeId)?.diagnostics.push(data.codePanelRowData);
        } else {
          this.otherCodePanelData.set(data.codePanelRowData.nodeId, {
            documentation: [],
            diagnostics: [data.codePanelRowData],
            comments: []
          });
        }
        if (this.userProfile?.preferences.showSystemComments) {
          this.codeLinesDataBuffer.push(data.codePanelRowData);
        }
      }

      if (data.directive === ReviewPageWorkerMessageDirective.InsertCommentRowData) {
        if (this.otherCodePanelData.has(data.codePanelRowData.nodeId)) {
          this.otherCodePanelData.get(data.codePanelRowData.nodeId)?.comments.push(data.codePanelRowData);
        } else {
          this.otherCodePanelData.set(data.codePanelRowData.nodeId, {
            documentation: [],
            diagnostics: [],
            comments: [data.codePanelRowData]
          });
        }
        if (this.userProfile?.preferences.showComments) {
          this.codeLinesDataBuffer.push(data.codePanelRowData);
        }
      }

      if (data.directive === ReviewPageWorkerMessageDirective.UpdateCodeLines) {
        this.codeLinesData = this.codeLinesDataBuffer;
        this.workerService.terminateWorker();
      }
    });
  }

  loadReviewContent(reviewId: string, activeApiRevisionId: string | null = null, diffApiRevisionId: string | null = null) {
    this.reviewsService.getReviewContent(reviewId, activeApiRevisionId, diffApiRevisionId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: ArrayBuffer) => {
            const apiTreeBuilderData : ApiTreeBuilderData = {
              onlyDiff: this.onlyDiff!,
              showDocumentation: this.userProfile?.preferences.showDocumentation!
            };
            // Passing ArrayBufer to worker is way faster than passing object
            this.workerService.postToApiTreeBuilder(response, apiTreeBuilderData);
          }
      });
  }

  loadReview(reviewId: string) {
    this.reviewsService.getReview(reviewId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (review: Review) => {
          this.review = review;
        }
      });
  }

  loadAPIRevisions(noOfItemsRead : number, pageSize: number) {
    // Ensure existing subscription is destroyed
    this.destroyLoadAPIRevision$?.next();
    this.destroyLoadAPIRevision$?.complete();
    this.destroyLoadAPIRevision$ = new Subject<void>();

    this.apiRevisionsService.getAPIRevisions(noOfItemsRead, pageSize, this.reviewId!)
      .pipe(takeUntil(this.destroyLoadAPIRevision$)).subscribe({
        next: (response: any) => {
          this.apiRevisions = response.result;
          if (this.apiRevisions.length > 0) {
            this.language = this.apiRevisions[0].language;
            this.languageSafeName = getLanguageCssSafeName(this.language);
          }
        }
      });
  }

  showRevisionsPanel(showRevisionsPanel : any){
    this.revisionSidePanel = showRevisionsPanel as boolean;
  }

  handleShowOnlyDiffEmitter(state: boolean) {
    let newQueryParams = getQueryParams(this.route);
    newQueryParams['onlyDiff'] = state;
    this.router.navigate([], { queryParams: newQueryParams });
  }

  handleShowCommentsEmitter(state: boolean) {
    let userPreferenceModel = this.userProfile?.preferences;
    userPreferenceModel!.showComments = state;
    this.userProfileService.updateUserPrefernece(userPreferenceModel!).pipe(takeUntil(this.destroy$)).subscribe();
    if (userPreferenceModel!.showComments) {
      this.codePanelComponent?.insertRowTypeIntoScroller(CodePanelRowDatatype.CommentThread);
    }
    else {
      this.codePanelComponent?.removeRowTypeFromScroller(CodePanelRowDatatype.CommentThread);
    }
  }

  handleShowSystemCommentsEmitter(state: boolean) {
    let userPreferenceModel = this.userProfile?.preferences;
    userPreferenceModel!.showSystemComments = state;
    this.userProfileService.updateUserPrefernece(userPreferenceModel!).pipe(takeUntil(this.destroy$)).subscribe();
    if (userPreferenceModel!.showSystemComments) {
      this.codePanelComponent?.insertRowTypeIntoScroller(CodePanelRowDatatype.Diagnostics);
    }
    else {
      this.codePanelComponent?.removeRowTypeFromScroller(CodePanelRowDatatype.Diagnostics);
    }
  }

  handleShowDocumentationEmitter(state: boolean) {
    let userPreferenceModel = this.userProfile?.preferences;
    userPreferenceModel!.showDocumentation = state;
    this.userProfileService.updateUserPrefernece(userPreferenceModel!).pipe(takeUntil(this.destroy$)).subscribe();
    if (userPreferenceModel!.showDocumentation) {
      this.codePanelComponent?.insertRowTypeIntoScroller(CodePanelRowDatatype.Documentation);
    }
    else {
      this.codePanelComponent?.removeRowTypeFromScroller(CodePanelRowDatatype.Documentation);
    }
  }

  ngOnDestroy() {
    this.workerService.terminateWorker();
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyLoadAPIRevision$?.next();
    this.destroyLoadAPIRevision$?.complete();
    this.destroyApiTreeBuilder$?.next();
    this.destroyApiTreeBuilder$?.complete();
  }
}
