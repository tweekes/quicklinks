angular.module('app').controller(
    "SettingsModalController", ['$scope','modals' ,'RefDA', function ($scope,modals,RefDA) {
    $scope.settingsSaved = {};
    $scope.settingsEditBuffer = {};
    loadDataSettings($scope,RefDA);

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

var loadDataSettings = function(scope,RefDA) {
    var select = {select:{ dtype: "settings"}};
    RefDA.query(select,function(r){
        if (r && r.length > 0 ) {
            scope.settingsSaved = r[0];
        } else {
            scope.settingsSaved = createSettingsInstance(RefDA);
        }
        scope.settingsEditBuffer =
              JSON.parse(JSON.stringify(scope.settingsSaved));
    });
};
