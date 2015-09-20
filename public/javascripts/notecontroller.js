angular.module('app').controller(
    "NoteDialogModalController",
    function( $scope, modals ) {
        $scope.params = modals.params();
        $scope.title = $scope.params.title.replace("*","");
        $scope.dismissText = "Close";
        $scope.go = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);