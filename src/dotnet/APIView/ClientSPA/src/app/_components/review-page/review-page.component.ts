import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, TreeNode } from 'primeng/api';
import { CommentItemModel, Review } from 'src/app/_models/review';
import { CodeLineData, ReviewPageWorkerMessageDirective } from 'src/app/_models/revision';
import { CommentsService } from 'src/app/_services/comments/comments.service';
import { ReviewsService } from 'src/app/_services/reviews/reviews.service';
import { WorkerService } from 'src/app/_services/worker/worker.service';

@Component({
  selector: 'app-review-page',
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.scss']
})
export class ReviewPageComponent implements OnInit, AfterViewInit {
  reviewId : string | null = null;
  activeApiRevisionId : string | null = null;
  diffApiRevisionId : string | null = null;

  review : Review | undefined = undefined;
  reviewComments : CommentItemModel[] | undefined = [];
  revisionSidePanel : boolean | undefined = undefined;
  reviewPageNavigation : TreeNode[] = [];
  codeLineBuffer: CodeLineData[] = [];
  codeLinesData: CodeLineData[] = [];

  sideMenu: MenuItem[] | undefined;

  constructor(private route: ActivatedRoute, private reviewsService: ReviewsService, private commentsService: CommentsService, private workerService: WorkerService) {}

  ngOnInit() {
    this.reviewId = this.route.snapshot.paramMap.get('reviewId');
    this.activeApiRevisionId = this.route.snapshot.queryParamMap.get('activeApiRevisionId');
    this.diffApiRevisionId = this.route.snapshot.queryParamMap.get('diffApiRevisionId');

    this.registerWorkerEventHandler();
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

  ngAfterViewInit() {
    this.commentsService.getComments(this.reviewId!).subscribe({
      next: (response: CommentItemModel[]) => {
        this.reviewComments = response;
      }
    });
  }

  registerWorkerEventHandler() {
    this.workerService.onMessageFromApiTreeBuilder().subscribe(data => {
      if (data.directive === ReviewPageWorkerMessageDirective.CreatePageNavigation) {
        this.reviewPageNavigation = data.navTree as TreeNode[];
      }

      if (data.directive === ReviewPageWorkerMessageDirective.InsertCodeLineData) {
        this.codeLineBuffer.push(data.codeLineData);
      }

      if (data.directive === ReviewPageWorkerMessageDirective.UpdateCodeLines) {
        this.codeLinesData = this.codeLineBuffer;
      }
    });
  }

  loadReviewContent(reviewId: string, activeApiRevisionId: string | null = null, diffApiRevisionId: string | null = null) {
    this.reviewsService.getReviewContent(reviewId, activeApiRevisionId, diffApiRevisionId).subscribe({
      next: (response: ArrayBuffer) => {
          // Passing ArrayBufer to worker is way faster than passing object
          this.workerService.postToApiTreeBuilder(response);
        }
    });
  }

  showRevisionsPanel(showRevisionsPanel : any){
    this.revisionSidePanel = showRevisionsPanel as boolean;
  }
}
