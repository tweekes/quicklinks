angular.module('app').controller(
    "SearchModalController",
    function( $scope, modals ) {
        $scope.searchResults = null;
        $scope.resultItem = new Pager($scope.searchResults,10,4);


        $scope.close = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);
