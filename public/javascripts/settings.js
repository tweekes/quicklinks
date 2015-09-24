angular.module('app').controller(
    "SettingsModalController",
    ['$scope','modals' ,'RefDA', 'Settings', function ($scope,modals,RefDA,Settings) {
    $scope.settingsSaved = null;
    $scope.settingsEditBuffer = null;

    $scope.versionInfo = {version:"1.2",release:"Sept 24,2015 - In progress"};

    Settings.getSettings(function(s) {
        $scope.settingsSaved = s;
        $scope.settingsEditBuffer = JSON.parse(JSON.stringify(s));
    });

    $scope.save = function() {
      $scope.settingsSaved.mainScreenColumns =
                $scope.settingsEditBuffer.mainScreenColumns;
      $scope.settingsSaved.mainScreenListFold =
                $scope.settingsEditBuffer.mainScreenListFold;
      $scope.settingsSaved.searchScreenResultNumberOfRows =
                $scope.settingsEditBuffer.searchScreenResultNumberOfRows;
      $scope.settingsSaved.$save(function (response) {
          modals.resolve();
       },
        function (response) {
          throw "Failed to save!"
        }
      );
    };
    $scope.cancel =  modals.reject;
}]);
