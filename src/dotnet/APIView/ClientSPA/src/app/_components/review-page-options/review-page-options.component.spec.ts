import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPageOptionsComponent } from './review-page-options.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpErrorInterceptorService } from 'src/app/_services/http-error-interceptor/http-error-interceptor.service';
import { PageOptionsSectionComponent } from '../shared/page-options-section/page-options-section.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedAppModule } from 'src/app/_modules/shared/shared-app.module';
import { ReviewPageModule } from 'src/app/_modules/review-page/review-page.module';
import { UserProfile } from 'src/app/_models/userProfile';
import { Review } from 'src/app/_models/review';
import { APIRevision } from 'src/app/_models/revision';
import { By } from '@angular/platform-browser';

describe('ReviewPageOptionsComponent', () => {
  let component: ReviewPageOptionsComponent;
  let fixture: ComponentFixture<ReviewPageOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReviewPageOptionsComponent,
        PageOptionsSectionComponent
      ],
      imports: [
        HttpClientTestingModule,,
        HttpClientModule,
        BrowserAnimationsModule,
        SharedAppModule,
        ReviewPageModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ reviewId: 'test' }),
              queryParamMap: convertToParamMap({ activeApiRevisionId: 'test', diffApiRevisionId: 'test' })
            }
          }
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptorService,
          multi: true
        }
      ]
    });
    fixture = TestBed.createComponent(ReviewPageOptionsComponent);
    component = fixture.componentInstance;

    // initialize component properties
    component.userProfile = new UserProfile();
    component.review = new Review();
    component.diffStyleInput = 'Full Diff';
    component.activeAPIRevision = new APIRevision();
    component.diffAPIRevision = new APIRevision();
    component.canApproveReview = false;
    component.reviewIsApproved = false;

    // Initialize child components
    const childComponentDE = fixture.debugElement.query(By.directive(PageOptionsSectionComponent));
    const childComponent = childComponentDE.componentInstance;

    childComponent.sectionName = 'Test Section';
    childComponent.collapsedInput = false
    childComponent.sectionId = 'Test Id'
    childComponent.collapsed = false;
    childComponent.sectionStateCookieKey = 'Test Key';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('First Release Approval Button', () => {
    it('should disable first release approval button when review is approved', () => {
      component.reviewIsApproved = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('#first-release-approval-button');
      expect(button).not.toBeTruthy();
      const message : HTMLElement = fixture.nativeElement.querySelector('#first-release-approval-message');
      expect(message.textContent?.startsWith("Approved for First Release By:")).toBeTruthy()
    });
    it('should disable first release approval button when review is not approved and user is not an approver', () => {
      component.reviewIsApproved = false;
      component.userProfile = new UserProfile();
      component.userProfile.userName = "test-user-1";
      component.preferredApprovers = ["test-user-2"]
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('#first-release-approval-button');
      expect(button).not.toBeTruthy();
      const message : HTMLElement = fixture.nativeElement.querySelector('#first-release-approval-message');
      expect(message.textContent).toEqual("First Release Approval Pending");
    });
    it('should enable first release approval button when review is not approved and user is an approver', () => {
      component.reviewIsApproved = false;
      component.userProfile = new UserProfile();
      component.userProfile.userName = "test-user";
      component.preferredApprovers = ["test-user"]
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('#first-release-approval-button');
      expect(button).toBeTruthy();
      const message : HTMLElement = fixture.nativeElement.querySelector('#first-release-approval-message');
      expect(message.textContent).toEqual("First Release Approval Pending");
    });
  });
});
