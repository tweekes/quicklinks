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



var data = [];


var matchTerms = function(item,terms) {
    console.log("term = " + terms + "item title = " + item.title);
};


function SearchMgr(refSections) {
  this.refSections = refSections;
  this.results = null;



  this.search = function(terms) {
    _.each(this.refSections, function(e) {
        console.log(e.key);
        console.log("jumpItems...");
        _.each(e.jumpItems, function(item) {
            matchTerms(item,terms)
        });

    });
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
