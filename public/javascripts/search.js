angular.module('app').controller(
    "SearchModalController",
    function( $scope, modals ) {
        $scope.searchResults = [];
        $scope.pgResultItems = new Pager($scope.searchResults,8,4);
        $scope.search = function (event) {
          $scope.searchResults = [];
          if (event.charCode == 13) { // 13 == CR or Enter
              var terms = $scope.searchText.split(/\s(?=(?:[^"]|"[^"]*")*$)/); // tokenises quoted strings
              console.log("Terms: ");
              _.each(terms,function (t){
                  console.log(t);
              });
              var s = new SearchMgr($scope.refSections);
              $scope.searchResults = s.search(terms);
          }
        };
        $scope.close = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);

// http://stackoverflow.com/questions/6961615/using-regexp-to-dynamically-create-a-regular-expression-and-filter-content
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search

function SearchMgr(refSections) {
  this.refSections = refSections;

  this.search = function(terms) {
    var reTerms = [];
    var results = [];

    _.each(terms, function(term){
        reTerms.push(new RegExp(term.replace(/"/g, ''), 'i'));
    });

    _.each(this.refSections, function(section) {
        searchSection(results,section,reTerms);
        searchList(results,section,section.jumpItems,reTerms);
        searchList(results,section,section.linkItems,reTerms);
    });

    results = results.sort(function(a,b) {return b.rank - a.rank});
    return results;
  };

}

var searchList = function(results,section,itemList,reTerms) {
  _.each(itemList, function(item) {
      var rank = matchTerms(item,reTerms);
      if (rank > 0) {
          results.push(
              {
                  sectionTitle: section.title,
                  sectionKey: section.key,
                  itemTitle: item.title,
                  link: item.link,
                  text: item.note,
                  rank: rank
              }
          );
      }
  });
};

var searchSection = function(results,section,reTerms) {
    var rank = 0;
    _.each(reTerms,function(re){
        if (section.hasOwnProperty("title") && section.title.search(re) != -1) {
            rank++;
        }
        if (section.hasOwnProperty("comment") && section.comment.search(re) != -1) {
            rank++;
        }
    });
    if (rank > 0) {
      results.push(
          {
              sectionTitle: section.title,
              sectionKey: section.key,
              itemTitle: "",
              link: "",
              text: section.comment,
              rank: rank
          }
      );
    }
};

var matchTerms = function(item,reTerms) {
    var rank = 0;
    // match against title,
    // search() returns the index of start of term if found, else -1.
    _.each(reTerms,function(re){
        if (item.hasOwnProperty("title") && item.title.search(re) != -1) {
            rank++;
        }
        if (item.hasOwnProperty("link") && item.link.search(re) != -1) {
            rank++;
        }
        if (item.hasOwnProperty("note") && item.note.search(re) != -1) {
            rank++;
        }
    });

    return rank;
    // console.log("term = " + terms + "item title = " + item.title);
};
