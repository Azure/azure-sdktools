import { HubConnection } from "@microsoft/signalr";
import * as hp from "./helpers";

const signalR = require('@microsoft/signalr');

let connection: HubConnection;
// sender/server side of comment refresh
export function pushComment(reviewId, elementId, partialViewResult) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    connection.invoke("PushComment", reviewId, elementId, partialViewResult);
  }
}

$(() => {
//-------------------------------------------------------------------------------------------------
// Create SignalR Connection and Register various events
//-------------------------------------------------------------------------------------------------

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${location.origin}/hubs/notification`, { 
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  async function start() {
    try {
      await connection.start();
    }
    catch (err) {
      console.log(err);
      setTimeout(start, 5000);
    }
  }

  connection.onclose(async () => {
    await start();
  });

  connection.on("RecieveNotification", (notification) => {
    hp.addToastNotification(notification);
  });

  // receiver/client side of comment refresh 
  connection.on("ReceiveComment", (reviewId, elementId, partialViewResult, username) => {
    checkReviewIdAgainstCurrent(reviewId);

    var rowSectionClasses = hp.getCodeRowSectionClasses(elementId);
    hp.showCommentBox(elementId, rowSectionClasses, undefined, false);

    let commentsRow = hp.getCommentsRow(elementId);
    hp.updateCommentThread(commentsRow, partialViewResult);
    // commented because we don't want to navigate user to updated comment
    hp.addCommentThreadNavigation();  
  });
    if (currReviewId != reviewId) {
      return;
    }
    var rowSectionClasses = hp.getCodeRowSectionClasses(elementId);
    hp.showCommentBox(elementId, rowSectionClasses, undefined, false);

    let commentsRow = hp.getCommentsRow(elementId);

    var rowSectionClasses = hp.getCodeRowSectionClasses(elementId);
    hp.showCommentBox(elementId, rowSectionClasses, undefined, false);

    let commentsRow = hp.getCommentsRow(elementId);
    hp.updateCommentThread(commentsRow, partialViewResult);
    hp.addCommentThreadNavigation();
    hp.removeCommentIconIfEmptyCommentBox(elementId);

    let size = 28;
    let url: string = "https://github.com/" + username + ".png?size=" + size;
    console.log(username); 
    $("div.review-thread-reply div.reply-cell img.comment-icon").attr("src", url);
  });

  let approvalPendingText = "Current Revision Approval Pending";
  let approvedByText = "Approved by:";
  let approvesCurrentRevisionText = "Approves the current revision of the API";

  connection.on("ReceiveApprovalSelf", (reviewId, revisionId, approvalToggle) => {
    hp.disableButtonTemp("form.form-inline button.btn", 5000);

    if (!checkReviewRevisionIdAgainstCurrent(reviewId, revisionId, true)) {
      return;
    }

    let $approvalSpans: JQuery<HTMLElement> = $("#approveCollapse span.small.text-muted");

    var indexResult = parseApprovalSpanIndex($approvalSpans, approvedByText, approvalPendingText, approvesCurrentRevisionText);
    let upperTextSpan = indexResult["upperText"];

    if (approvalToggle) {
      removeUpperTextSpan(upperTextSpan, $approvalSpans);
      addButtonApproval();
    } else {
      addUpperTextSpan(approvesCurrentRevisionText);
      removeButtonApproval();
    }
  });

  connection.on("ReceiveApproval", (reviewId, revisionId, approver, approvalToggle) => {
    if (!checkReviewRevisionIdAgainstCurrent(reviewId, revisionId, true)) {
      return;
    }

    let $approvalSpans: JQuery<HTMLElement> = $("#approveCollapse span.small.text-muted");

    var indexResult = parseApprovalSpanIndex($approvalSpans, approvedByText, approvalPendingText, approvesCurrentRevisionText);
    let approversIndex = indexResult["approvers"];

    if (approversIndex === -1) {
      return;
    }

    let lowerTextSpan: HTMLElement = $approvalSpans[approversIndex];
    let approverHref = `/Assemblies/Profile/${approver}`;

    if (approvalToggle) {
      addApprover(lowerTextSpan, approvedByText, approverHref, approver);
    } else {
      removeApprover(lowerTextSpan, approver, approvalPendingText);
    }
  })

  // Start the connection.
  start();
});

/**
 * Removes the @approver from @lowerTextSpan of review page
 * @param lowerTextSpan HTMLElement of the span that contains who approved the review or pending approval
 * @param approver GitHub username of the review approver
 * @param approvalPendingText string of approval pending text to use when removing the last approver
 */
function removeApprover(lowerTextSpan: HTMLElement, approver: string, approvalPendingText: string) {
    let children = lowerTextSpan.children;
    let numApprovers = children.length;

    if (numApprovers > 1) {
        removeApproverFromApproversList(children, approver);
    } else {
        lowerTextSpan.textContent = approvalPendingText;
        removeApprovalBorder();
    }
}

/**
 * adds the @approver to @lowerTextSpan of review page
 * @param lowerTextSpan HTMLElement of the span that contains who approved the review or pending approval
 * @param approvedByText string that comes before list of approvers
 * @param approverHref relative href of user's apiview profile
 * @param approver GitHub username of the review approver 
 */
function addApprover(lowerTextSpan: HTMLElement, approvedByText: string, approverHref: string, approver: any) {
    if (lowerTextSpan.textContent?.includes(approvedByText)) {
        lowerTextSpan.append(" , ");
    } else {
        lowerTextSpan.textContent = approvedByText;
        addApprovedBorder();
    }
    addApproverHrefToApprovers(lowerTextSpan, approverHref, approver);
}

/**
 * adds the @approver with a hyperlink to their apiview profile to @lowerTextSpan
 */
function addApproverHrefToApprovers(lowerTextSpan: HTMLElement, approverHref: string, approver: any) {
    $(lowerTextSpan).append('<a href="' + approverHref + '">' + approver + '</a>');
}

/**
 * adds the text above the approve button to indicate whether the current user approved the review
 */
function addUpperTextSpan(approvesCurrentRevisionText: string) {
    let $upperTextSpan = $("<span>").text(approvesCurrentRevisionText).addClass("small text-muted");
    let $upperTextForm = $("ul#approveCollapse form.form-inline");
    $upperTextForm.prepend($upperTextSpan);
}

/**
 * change the button state from a green "not approved" to grey "approved"
 */
function addButtonApproval() {
    let $approveBtn = $("form.form-inline button.btn.btn-success");
    $approveBtn.removeClass("btn-success");
    $approveBtn.addClass("btn-outline-secondary");
    $approveBtn.text("Revert API Approval");
}

/**
 * change the button state from a grey "approved" to green "not approved" 
 */
function removeButtonApproval() {
    let $approveBtn = $("form.form-inline button.btn.btn-outline-secondary");
    $approveBtn.removeClass("btn-outline-secondary");
    $approveBtn.addClass("btn-success");
    $approveBtn.text("Approve");
}

/**
 * change the review panel border state from grey "not approved" to green "approved"
 */
function addApprovedBorder() {
  let reviewLeft = $("#review-left");
  reviewLeft.addClass("review-approved");
  reviewLeft.removeClass("border");
  reviewLeft.removeClass("rounded-1");

  let reviewRight = $("#review-right");
  reviewRight.addClass("review-approved");
  reviewRight.removeClass("border");
  reviewRight.removeClass("rounded-1");
}

/**
 * change the review panel border state from green "approved" to grey "not approved"
 */
function removeApprovalBorder() {
    let $reviewLeft = $("#review-left");
    $reviewLeft.removeClass("review-approved");
    $reviewLeft.addClass("border");
    $reviewLeft.addClass("rounded-1");

    let $reviewRight = $("#review-right");
    $reviewRight.removeClass("review-approved");
    $reviewRight.addClass("border");
    $reviewRight.addClass("rounded-1");
}

/**
 * parse the approval spans for its existence and order
 * @param $approvalSpans may contain <upper text>, <approve button>, and/or <lower text>
 * @param approvedByText string for <lower text> that indicates preexisting approvers
 * @param approvalPendingText string for <lower text> that indicates no current approvers
 * @param approvesCurrentRevisionText string for <upper text> that indicates the current user did not approve
 * @returns a dictionary with the index of the upper and lower text elements. Value is -1 if an element does not exist.
 */
function parseApprovalSpanIndex($approvalSpans: JQuery<HTMLElement>, approvedByText: string, approvalPendingText: string, approvesCurrentRevisionText: string) {
  let indexResult = {
      "approvers": -1,
      "upperText": -1,
  };

  for (var i = 0; i < $approvalSpans.length; i++) {
    let content = $approvalSpans[i].textContent;

    if (!content) {
      return indexResult;
    }

    if (content.includes(approvedByText) || content.includes(approvalPendingText)) {
          indexResult["approvers"] = i;
      }
    if (content.includes(approvesCurrentRevisionText)) {
      indexResult["upperText"] = i;
      }
  }

  return indexResult;
}

/**
 * call when the current user approves the current review. removes the upper text 
 * @param upperTextIndex index of the upper text in @$approvalSpans
 * @param $approvalSpans span that includes revision approval block 
 */
function removeUpperTextSpan(upperTextIndex: number, $approvalSpans: JQuery<HTMLElement>) {
    if (upperTextIndex !== -1) {
        let upperTextSpan: HTMLElement = $approvalSpans[upperTextIndex];
      upperTextSpan.remove();
    }
}

/**
 * remove the @approver from list of @approvers 
 * @param approvers list of preexisting approvers
 * @param approver GitHub username of user to remove from the list 
 */
function removeApproverFromApproversList(approvers, approver) {
  for (var i = 0; i < approvers.length; i++) {
    if (approvers[i].innerHTML === approver) {
      if (i === 0) {
        approvers[i].nextSibling?.remove();
      } else {
        approvers[i].previousSibling?.remove();
      }
      approvers[i].remove();
      break;
    }
  }
}

/**
 * returns true if the current reviewId is equivalent to the @reviewId and false otherwise
 */
function checkReviewIdAgainstCurrent(reviewId) {
  return checkReviewRevisionIdAgainstCurrent(reviewId, null, false);
}

/**
 * @returns true if the current reviewId is equivalent to the @reviewId and @revisionId
 *          whether we check @revisionId depends on the value of @checkRevision
 *          false otherwise
 * @param checkRevision true indicates that both @reviewId and @revisionId must match,
 *                      false indicates that only @reviewId can match
 */
function checkReviewRevisionIdAgainstCurrent(reviewId, revisionId, checkRevision) {
  let href = location.href;
  let result = hp.getReviewAndRevisionIdFromUrl(href);
  let currReviewId = result["reviewId"];
  let currRevisionId = result["revisionId"];

  if (currReviewId != reviewId) {
    return false;
  }

  if (checkRevision && currRevisionId && currRevisionId === revisionId) {
    return false;
  }

  return true;
}
