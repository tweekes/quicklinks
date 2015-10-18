angular.module('app').controller(
    "SettingsModalController",
    ['$scope','modals' ,'RefDA', 'Settings','$http','DataMigrationMgr',
        function ($scope,modals,RefDA,Settings,$http,DataMigrationMgr) {
    $scope.settingsSaved = null;
    $scope.settingsEditBuffer = null;

    // {"region":"Development","data_file":"../quicklink-data/quicklinks.db","image_dir":"../quicklink-data/images","version":"1.2.2","version_date":"Sept 24, 2015"}
    $http.get('/version').then(
        function(response) {

            $scope.versionInfo = {
                version:response.data.version,
                release:response.data.version_date,
                region:response.data.region
            };
        },
        function(response) {

        }
    );

    Settings.getSettings(function(s) {
        $scope.settingsSaved = s;
        $scope.settingsEditBuffer = cloneObject(s);
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

    $scope.runNextDataMigration = function() {
        // DataMigrationMgr.applyNextMigration();
        DataMigrationMgr.applyNextMigration();
    };

    $scope.cancel =  modals.reject;
}]);
