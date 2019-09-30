addEventListener("load", function () {
    $(".nav-list-toggle").click(function () {
        $(this).parents(".nav-list-group").first().toggleClass("nav-list-collapsed");
    });
});
addEventListener("load", function () {
    $(".custom-file-input").on("change", function () {
        var fileName = this.files[0].name;
        $(this).next(".custom-file-label").html(fileName);
    });
});
$(function () {
    var commentFormTemplate = $("#comment-form-template");
    $(document).on("click", ".commentable", function (e) {
        showCommentBox(e.target.id);
        e.preventDefault();
    });
    $(document).on("click", ".line-comment-button", function (e) {
        showCommentBox(getLineId(e.target));
        e.preventDefault();
    });
    $(document).on("click", ".comment-cancel-button", function (e) {
        hideCommentBox(getLineId(e.target));
        e.preventDefault();
    });
    $(document).on("click", "[data-post-update='comments']", function (e) {
        var form = $(e.target).closest("form");
        var lineId = getLineId(e.target);
        var commentRow = getCommentBox(lineId);
        var serializedForm = form.serializeArray();
        serializedForm.push({ name: "lineId", value: lineId });
        $.ajax({
            type: "POST",
            url: $(form).prop("action"),
            data: $.param(serializedForm)
        }).done(function (partialViewResult) {
            updateCommentThread(commentRow, partialViewResult);
        });
        e.preventDefault();
    });
    $(document).on("click", ".review-thread-reply-button", function (e) {
        showCommentBox(getLineId(e.target));
        e.preventDefault();
    });
    $(document).on("click", ".toggle-comments", function (e) {
        toggleComments(getLineId(e.target));
        e.preventDefault();
    });
    function getLineId(element) {
        return $(element).closest("[data-line-id]").data("line-id");
    }
    function toggleComments(id) {
        getCommentBox(id).find(".comment-holder").toggle();
    }
    function getCommentBox(id) {
        return $(".comment-box[data-line-id='" + id + "']");
    }
    function hideCommentBox(id) {
        var thisRow = $(document.getElementById(id)).parents(".code-line").first();
        var diagnosticsRow = thisRow.next();
        var nextRow = diagnosticsRow.next();
        nextRow.find(".review-thread-reply").show();
        nextRow.find(".comment-form").hide();
    }
    function showCommentBox(id) {
        var thisRow = $(document.getElementById(id)).parents(".code-line").first();
        var diagnosticsRow = thisRow.next();
        var nextRow = diagnosticsRow.next();
        var commentBox = nextRow.find(".comment-form");
        if (commentBox.length === 0) {
            commentBox = commentFormTemplate.children().clone();
            var thread = nextRow.find(".comment-thread-contents");
            if (thread.length > 0) {
                thread.after(commentBox);
            }
            else {
                commentBox.insertAfter(diagnosticsRow).wrap("<tr class=\"comment-box\" data-line-id=\"" + id + "\">").wrap("<td colspan=\"2\">");
            }
        }
        commentBox.show();
        commentBox.find(".elementIdInput").val(id);
        commentBox.find(".new-thread-comment-text").focus();
        nextRow.find(".review-thread-reply").hide();
        return false;
    }
    function updateCommentThread(commentBox, partialViewResult) {
        partialViewResult = $.parseHTML(partialViewResult);
        $(commentBox).replaceWith(partialViewResult);
        return false;
    }
});
//# sourceMappingURL=site.js.map