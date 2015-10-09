angular.module('app')
    .factory('RefDA',['$resource', function($resource) {
        // See page 110 of AngularJS book.
        // https://docs.angularjs.org/api/ngResource/service/$resource
        return $resource('/model/qlinks/:refId',
            {refId:'@_id'},
            {
             create: {method:'POST', params:{}, isArray:false},
             save: {method:'POST'}

            }
        );
    }]);

// Translatee date strings to Date when loading from database.
angular.module('app').config(["$httpProvider", function ($httpProvider) {
     $httpProvider.defaults.transformResponse.push(function(responseData){
        convertDateStringsToDates(responseData);
        return responseData;
    });
}]);
