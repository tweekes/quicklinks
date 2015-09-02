angular.module('app').controller(
    "SettingsModalController",
    function( $scope, modals ) {

      $scope.close = modals.resolve;
      $scope.dismiss = modals.reject;
  }
);
