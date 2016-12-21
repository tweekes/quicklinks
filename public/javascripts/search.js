
var lastState = null;

angular.module('app').controller(
    "SearchModalController",
    function( $scope, modals) {
        $scope.searchResults = [];
        $scope.searchUrlText = true;
        $scope.searchResultCount = "";

        lastStateRestore($scope); // Restore last search state if one exists.

        $scope.updatePageSearchPageState = function() {
          // Settings come from the parent scope.
          $scope.pgResultItems = new Pager($scope.searchResults,
                                           $scope.settings.searchScreenResultNumberOfRows,
                                           4);
          if ($scope.searchResults && $scope.searchResults.length > 0) {
           $scope.searchResultCount = "("+ $scope.searchResults.length + ")";
          } else {
           $scope.searchResultCount = "";
          }
        }

        $scope.search = function (event) {
          $scope.searchResults = [];
          $scope.updatePageSearchPageState();
          if (event.charCode == 13) { // 13 == CR or Enter
              var terms = $scope.searchText.split(/\s(?=(?:[^"]|"[^"]*")*$)/); // tokenises quoted strings
              var s = new SearchMgr($scope.refSections);
              $scope.searchResults = s.search(terms,$scope.conditionAND,$scope.searchUrlText);
              $scope.updatePageSearchPageState();
              lastStatePersist($scope);
          }
        };

        $scope.searchTextChanged = function() {

            if ($scope.searchText === "") {
              $scope.searchResults = [];
              lastStatePersist($scope);
              $scope.updatePageSearchPageState();
            }
        }

        $scope.close = function () {
            lastStateReset()
            modals.resolve();
        }

        $scope.dismiss = modals.reject;
    }
);

function lastStateReset() {
  lastState = null;
}

function lastStatePersist(scope) {
  lastState = {};
  lastState.searchText = scope.searchText;
  lastState.searchUrlText = scope.searchUrlText;
  lastState.searchResults = scope.searchResults;
  lastState.conditionAND = scope.conditionAND;
  lastState.pgResultItem = scope.pgResultItems;

}

function lastStateRestore(scope) {
  if (lastState !== null) {
    scope.searchText = lastState.searchText;
    scope.searchUrlText = lastState.searchUrlText;
    scope.searchResults = lastState.searchResults;
    scope.conditionAND = lastState.conditionAND;
    scope.pgResultItems = lastState.pgResultItem;
  }
}

// http://stackoverflow.com/questions/6961615/using-regexp-to-dynamically-create-a-regular-expression-and-filter-content
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search

function SearchMgr(refSections) {
  this.refSections = refSections;

  // searhes sections and items in those sections for the search terms provided.
  // searchUrlText - a flag indicating if the text in urls should be included in the
  // search. e.g. "life" in a search will match all sharepoint URLs which might be
  // too many results.
  this.search = function(terms,conditionAND, searchUrlText) {
    var reTerms = [];
    var results = [];

    _.each(terms, function(term){
        var reTerm = {};
        reTerm.boost = false; // e.g. Sunshine "Tan Solution"^ then results with Tan SOlution will have rank increased.
        reTerm.exclude = false;
        // Previous token  processing gives ""Tan Solution"^" when boost paramter is presented.
        if (term.search(/\^/) !== -1) {
            // Remove the boost character ^ from the string = ""Tan Solution"^" ==> "Tan Solution"
            term = term.replace(/\^/,'');
            reTerm.boost = true;
        }

        // When minus operator is presented as -test -"test test" test
        // then terms = ["-test", "-"test test"", "", "test"],
        if (term.search(/^\-/) !== -1) {
          term = term.replace(/^\-/,'');
          reTerm.exclude = true;
        }

        // Remove quoutes inside the search term.
        term = term.replace(/\"/g,'');

        // Prevent empty terms going through - as they will distort results when all terms flag is set.
        if (term.length > 0) {
          reTerm.rexpr = new RegExp(term.replace(/"/g, ''), 'i');
          reTerms.push(reTerm);
        }
    });

    _.each(this.refSections, function(section) {
        searchSection(results,section,conditionAND, reTerms);
        searchList(results,section,section.jumpItems,conditionAND,reTerms,searchUrlText,"ITEM_JUMP");
        searchList(results,section,section.linkItems,conditionAND,reTerms,searchUrlText,"ITEM_LINK");
    });

    results = results.sort(function(a,b) {return b.rank - a.rank});
    return results;
  };

}

var searchList = function(results,section,itemList,conditionAND,reTerms,searchUrlText,itemType) {
    var index = 0;
    _.each(itemList, function(item) {
      var rank = matchTerms(item,reTerms,conditionAND,searchUrlText);
      if (rank > 0) {
          results.push(
              {
                  section: section,
                  item: item,
                  itemType: itemType,
                  itemIndex: index,
                  rank: rank,
                  text:item.note
              }
          );
      }
      index++;
  });
};

var searchSection = function(results,section,conditionAND,reTerms) {
    var rank = 0;
    var allTermsFound = true;
    // If the minus operator is applied to term and term is found then section is excluded.
    var exclude = false;
    _.each(reTerms,function(re){
        var found = false;
        // if a term is excludes using minus operator then it is assumed to be found.
        // or put another way, an excluded term does not interfere with AND condition.
        if (re.exclude) found = true;

        if (section.hasOwnProperty("title") && section.title.search(re.rexpr) != -1) {
            rank+=10; found = true;
            if (re.boost ) rank+=20;
            if (re.exclude) exclude = true;
        }
        if (section.hasOwnProperty("comment") && section.comment.search(re.rexpr) != -1) {
            rank++; found = true;
            if (re.boost ) rank+=20;
            if (re.exclude) exclude = true;
        }

        if (found === false) {
          allTermsFound = false;
        }
    });

    // Only include if all search terms have been found and Exclude is false;
    // Rank is overridden to be zero if all terms have not been found when 'All Terms' is set
    // by user (var conditionAND)
    // OR an excluded term is found.
    if ((allTermsFound === false && conditionAND === true) || exclude === true) {
      rank=0;
    }

    if (rank > 0) {
      results.push(
          {
              section:section,
              rank: rank,
              text:section.comment
          }
      );
    }
};

var matchTerms = function(item,reTerms,conditionAND,searchUrlText) {
    var rank = 0;
    var allTermsFound = true;
    // If the minus operator is applied to term and term is found then section is excluded.
    var exclude = false;
    // match against title,
    // search() returns the index of start of term if found, else -1.
    _.each(reTerms,function(re){
        var found = false;

        // if a term is excludes using minus operator then it is assumed to be found.
        // or put another way, an excluded term does not interfere with AND condition.
        if (re.exclude) found = true;

        if (item.hasOwnProperty("title") && item.title.search(re.rexpr) != -1) {
            rank+=10; found = true;
            if (re.boost ) rank+=20;
            if (re.exclude) exclude = true;
        }

        if (searchUrlText && item.hasOwnProperty("link") && item.link.search(re.rexpr) != -1) {
            rank++; found = true;
            if (re.boost ) rank+=20;
            if (re.exclude) exclude = true;
        }

        if (item.hasOwnProperty("note") && item.note.search(re.rexpr) != -1) {
            rank++; found = true;
            if (re.boost ) rank+=20;
            if (re.exclude) exclude = true;
        }

        // "images":[{"fileName":"nssm editor.png"},{"fileName":"nssm editor.png"}]
        if (item.hasOwnProperty("images")) {
           _.each(item.images, function(imgElement){
              if(imgElement.fileName.search(re.rexpr) != -1) {
                  rank++; found = true;
                  if (re.boost ) rank+=20;
                  if (re.exclude) exclude = true;
              }
           });
        }
        if (found === false) {
          allTermsFound = false;
        }
    });

    // Only include if all search terms have been found and Exclude is false;
    // Rank is overridden to be zero if all terms have not been found when 'All Terms' is set
    // by user (var conditionAND)
    // OR an excluded term is found.
    if ((allTermsFound === false && conditionAND === true) || exclude === true) {
      rank=0;
    }


    return rank;
    // console.log("term = " + terms + "item title = " + item.title);
};
