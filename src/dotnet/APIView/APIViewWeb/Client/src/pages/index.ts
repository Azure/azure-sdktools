import { rightOffCanvasNavToggle } from "../shared/off-canvas";
import { updatePageSettings } from "../shared/helpers";

$(() => {
  const defaultPageSize = 50;
  const reviewsFilterPartial = $( '#reviews-filter-partial' );
  const languageFilter = $( '#language-filter-select' );
  const stateFilter = $( '#state-filter-select' );
  const statusFilter = $( '#status-filter-select' );
  const typeFilter = $('#type-filter-select');
  const firstReleaseApprovalFilter = $('#first-release-approval-filter-select');
  const searchBox = $( '#reviews-table-search-box' );
  const searchButton = $( '#reviews-search-button' );
  const resetButton = $('#reset-filter-button');
  const languageSelect = $('#review-language-select');

  // Import underscorejs
  var _ = require('underscore');

  // Computes the uri string using the values of search, pagination and various filters
  // Invokes partial page update to list of reviews using ajax
  // Updates the uri displayed on the client
  function updateListedReviews({ pageNo = 1, pageSize = defaultPageSize } = {})
  {
    var uri = '?handler=reviewspartial';
    var searchQuery = searchBox.val() as string;

    if (searchQuery != null && searchQuery.trim() != '')
    {
      var searchTerms = searchQuery.trim().split(/\s+/);
      searchTerms.forEach(function(value, index){
        uri = uri + '&search=' + encodeURIComponent(value);
      });
    }

    languageFilter.children(":selected").each(function() {
      uri = uri + '&languages=' + encodeURIComponent(`${$(this).val()}`);
    });
    
    stateFilter.children(":selected").each(function() {
      uri = uri + '&state=' + encodeURIComponent(`${$(this).val()}`);
    });

    statusFilter.children(":selected").each(function() {
      uri = uri + '&status=' + encodeURIComponent(`${$(this).val()}`);
    });

    typeFilter.children(":selected").each(function() {
      uri = uri + '&type=' + encodeURIComponent(`${$(this).val()}`);
    });

    firstReleaseApprovalFilter.children(":selected").each(function () {
      uri = uri + '&firstReleaseApproval=' + encodeURIComponent(`${$(this).val()}`);
    });

    uri = uri + '&pageNo=' + encodeURIComponent(pageNo);
    uri = uri + '&pageSize=' + encodeURIComponent(pageSize);
    uri = encodeURI(uri);

    $.ajax({
      url: uri
    }).done(function(partialViewResult) {
      reviewsFilterPartial.html(partialViewResult);
      history.pushState({}, '', uri.replace('handler=reviewspartial&', ''));
      addPaginationEventHandlers(); // This ensures that the event handlers are re-added after ajax refresh
    });
  }

  // Add custom behaviour and event to pagination buttons
  function addPaginationEventHandlers()
  {
    $( '.page-link' ).each(function() {
      $(this).on('click', function(event){
        event.preventDefault();
        var linkParts = $(this).prop('href').split('/');
        var pageNo = linkParts[linkParts.length - 1];
        if (pageNo !== null && pageNo !== undefined)
        {
          updateListedReviews({ pageNo: pageNo });
        }
      });
    });
  }

  // Fetch content of dropdown on page load
  $(document).ready(function () {
    const options = { csvDispCount: 1, selectAll: true };
    (<any>languageFilter).SumoSelect(options);
    (<any>stateFilter).SumoSelect(options);
    (<any>statusFilter).SumoSelect(options);
    (<any>typeFilter).SumoSelect(options);
    (<any>firstReleaseApprovalFilter).SumoSelect(options);
    addPaginationEventHandlers();
  });

  $("#uploadModel").on("show.bs.modal", function () {
    (<any>languageSelect).SumoSelect({
      placeholder: 'Language'
    });
  });

  // Update list of reviews when any dropdown is changed
  [languageFilter, stateFilter, statusFilter, typeFilter, firstReleaseApprovalFilter].forEach(function(value, index) {
    value.on('sumo:closed', function() {
      updateListedReviews();
    });
  });

  // Update list of reviews based on search input
  searchBox.on('input', _.debounce(function(e) {
    updateListedReviews();
  }, 600));

  searchButton.on('click', function() {
    updateListedReviews();
  });

  // Reset list of reviews as well as filters
  resetButton.on('click', function (e) {
    (<any>$('#language-filter-select')[0]).sumo.unSelectAll();
    (<any>$('#state-filter-select')[0]).sumo.unSelectAll();
    (<any>$('#state-filter-select')[0]).sumo.selectItem('Open');
    (<any>$('#status-filter-select')[0]).sumo.unSelectAll();
    (<any>$('#type-filter-select')[0]).sumo.unSelectAll();
    (<any>$('#first-release-approval-filter-select')[0]).sumo.unSelectAll();
    searchBox.val('');
    updateListedReviews();
  });

  var prevLanguageValue = languageSelect.val();
  languageSelect.on('sumo:closed', function (e) {
    var val = $(this).val() as string;
    if (val == "C++" || val == "C#") {
      val = val.replace("C++", "Cpp").replace("C#", "Csharp");
    }
    $("#uploadModel").find(".card-body > div").addClass("d-none");
    var helpName = "#" + val.toLowerCase() + "-help";
    $(helpName).removeClass("d-none");
    if (val == 'TypeSpec' || prevLanguageValue == 'TypeSpec') {
      const fileSelectors = $(".package-selector");
      for (var i = 0; i < fileSelectors.length; i++) {
        $(fileSelectors[i]).toggleClass("d-none");
      }
    }
    prevLanguageValue = val;
  });

  // Open / Close right Offcanvas Menu
  $("#index-right-offcanvas-toggle").on('click', function () {
    updatePageSettings(function () {
      rightOffCanvasNavToggle("index-main-container");
    });
  });
});
