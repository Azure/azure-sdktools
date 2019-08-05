﻿// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your Javascript code.
$(function () {
    let commentFormTemplate = $("#comment-form-template");

    function hideCommentBox(id) {
        var thisRow = $(document.getElementById(id)).parents(".code-line").first();
        var nextRow = thisRow.next();
        nextRow.find(".review-thread-reply").show();
        nextRow.find(".comment-form").hide();
    }

    function showCommentBox(id) {
        let thisRow = $(document.getElementById(id)).parents(".code-line").first();
        let nextRow = thisRow.next();
        let commentForm = nextRow.find(".comment-form");

        if (commentForm.length == 0) {
            commentForm = commentFormTemplate.children().clone();

            var thread = nextRow.find(".comment-thread-contents");
            if (thread.length > 0) {
                thread.after(commentForm);
            }
            else {
                commentForm.insertAfter(thisRow).wrap("<tr>").wrap("<td colspan=\"2\">");
            }
        }

        commentForm.show();
        commentForm.find(".id-box").val(id);
        commentForm.find(".new-thread-comment-text").focus();
        commentForm.find(".comment-cancel-button").click(function () { hideCommentBox(id); });
        commentForm.find(".comment-submit-button").click(function () {
            $.ajax({
                type: "POST",
                data: commentForm.find("form").serialize()
            }).done(function (partialViewResult) {
                thisRow.next().replaceWith(partialViewResult);
                thisRow.next().find(".review-thread-reply-button").click(function () {
                    showCommentBox($(this).data("element-id"));
                });
            });
            return false;
        });

        nextRow.find(".review-thread-reply").hide();
    }

    $(".commentable").click(function () {
        showCommentBox(this.id);
        return false;
    });

    $(".review-thread-reply-button").click(function () {
        showCommentBox($(this).data("element-id"));
    });

    $(".code-line").hover(function () {
        var button = $(this).find(".line-comment-button");
        button.toggleClass("is-hovered");
    });

    $(".line-comment-button").click(function () {
        showCommentBox($(this).data("element-id"));
        return false;
    });
});
