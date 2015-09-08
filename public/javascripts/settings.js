angular.module('app').controller(
    "SettingsModalController", ['$scope','modals' ,'RefDA', function ($scope,modals,RefDA) {
    loadData($scope,RefDA);





     $scope.close = modals.resolve;
     $scope.dismiss = modals.reject;



}]);


var loadData = function(scope,RefDA) {
    var select = {select:{ dtype: "settings"}};
    RefDA.query(select,function(r){
        if (r && r.length > 0 ) {
            scope.settings = r[0];
        } else {
            scope.settings = createSettingsInstance(RefDA);
            scope.settings.$save();
        }
    });
};

var createSettingsInstance = function( RefDA ) {
    var d = new Date();
    var obj = new RefDA;
    obj.dtype = "settings";
    obj.mainScreenColumns = 4;
    obj.mainScreenListFold = 5;
    obj.searchScreenResultNumberOfRows = 6;
    return obj;
};

