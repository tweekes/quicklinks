angular.module('app').controller(
    "SearchModalController",
    function( $scope, modals ) {
        $scope.searchResults = [
          {
            sectionTitle:"Life Claims Replacement",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "QPS Manage Custom Locations",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "see BRL3394 and BRL3727 for details in Mail Code Generation in the below Documant"
          },
          {
            sectionTitle:"Life Claims Replacement",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "QPS Manage Custom Locations",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Username: tom.weekes Password: 3CYg-M78VK;3"
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          },
          {
            sectionTitle:"EPay",
            sectionKey:"lifeClaimsReplacement",
            itemTitle: "Share Point ",
            link: "http://sp.sunlifecorp.com/sites/QPSDR/QPSDocumentsRequirements/05.%20QBEV04-Sale/UC%2019.06%20Manage%20Custom%20Locations.doc",
            note: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen "
          }
        ];

        $scope.pgResultItems = new Pager($scope.searchResults,8,4);

        $scope.close = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);

var matchTerms = function(item,reTerms) {
    var rank = 0;

    // match against title
    _.each(reTerms,function(re){
        if (item.title.search(re) != -1) {
            rank++;
        }
    });

    // match against link
    _.each(reTerms,function(re){
        if (item.link.search(re) != -1) {
            rank++;
        }
    });

    // match against note
    _.each(reTerms,function(re){
        if (item.note.search(re) != -1) {
            rank++;
        }
    });

    return rank;

    // console.log("term = " + terms + "item title = " + item.title);
};


// http://stackoverflow.com/questions/6961615/using-regexp-to-dynamically-create-a-regular-expression-and-filter-content
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search

function SearchMgr(refSections) {
  this.refSections = refSections;
  this.search = function(terms) {
    var reTerms = [];
    var results = [];

    _.each(terms, function(term){
        reTerms.push(new RegExp(term, 'i'));
    });

    _.each(this.refSections, function(section) {
        _.each(section.jumpItems, function(item) {
            var rank = matchTerms(item,reTerms);
            if (rank > 0) {
                console.log("push");
                results.push(
                    {
                        sectionTitle: section.title,
                        sectionKey: section.key,
                        itemTitle: item.title,
                        link: item.link,
                        note: item.note,
                        rank: rank
                    }
                );
            }
        });
    });

    return results;
  };


  /*
  section[]
    -title
    -comment
    jumpItems[]
      -title
      -link
      -note
    linkItems[]
      -title
      -link
      -note
  */










}
