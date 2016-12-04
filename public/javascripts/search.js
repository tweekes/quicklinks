angular.module('app').controller(
    "SearchModalController",
    function( $scope, modals) {
        $scope.searchResults = [];
        $scope.searchUrlText = true;
        $scope.searchResultCount = "";

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

        $scope.updatePageSearchPageState();

        $scope.search = function (event) {
          $scope.searchResults = [];
          $scope.updatePageSearchPageState();
          if (event.charCode == 13) { // 13 == CR or Enter
              var terms = $scope.searchText.split(/\s(?=(?:[^"]|"[^"]*")*$)/); // tokenises quoted strings
              var s = new SearchMgr($scope.refSections);
              $scope.searchResults = s.search(terms,$scope.conditionAND,$scope.searchUrlText);
              $scope.updatePageSearchPageState();
          }
        };

        $scope.searchTextChanged = function() {

            if ($scope.searchText === "") {
              $scope.searchResults = [];
              $scope.updatePageSearchPageState();
            }
        }

        $scope.close = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);

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
        reTerms.push(new RegExp(term.replace(/"/g, ''), 'i'));
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
    _.each(reTerms,function(re){
        var found = false;
        if (section.hasOwnProperty("title") && section.title.search(re) != -1) {
            rank+=10; found = true;
        }
        if (section.hasOwnProperty("comment") && section.comment.search(re) != -1) {
            rank++; found = true;
        }
        if (found === false) {
          allTermsFound = false;
        }
    });

    // Only include if all search terms have been found.
    if (allTermsFound === false && conditionAND === true) {
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
    // match against title,
    // search() returns the index of start of term if found, else -1.
    _.each(reTerms,function(re){
        var found = false;
        if (item.hasOwnProperty("title") && item.title.search(re) != -1) {
            rank+=10; found = true;
        }

        if (searchUrlText && item.hasOwnProperty("link") && item.link.search(re) != -1) {
            rank++; found = true;
        }

        if (item.hasOwnProperty("note") && item.note.search(re) != -1) {
            rank++; found = true;
        }

        // "images":[{"fileName":"nssm editor.png"},{"fileName":"nssm editor.png"}]
        if (item.hasOwnProperty("images")) {
           _.each(item.images, function(imgElement){
              if(imgElement.fileName.search(re) != -1) {
                  rank++; found = true;
              }
           });
        }
        if (found === false) {
          allTermsFound = false;
        }

    });

    // Only include if all search terms have been found.
    if (allTermsFound === false && conditionAND === true) {
      rank=0;
    }

    return rank;
    // console.log("term = " + terms + "item title = " + item.title);
};
