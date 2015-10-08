
angular.module('app')
    .factory('RefDA',['$resource', function($resource) {
        // See page 110 of AngularJS book.
        // https://docs.angularjs.org/api/ngResource/service/$resource
        return $resource('/model/qlinks/:refId',
            {refId:'@_id'},
            {
            // query: {method:'GET', isArray: true, interceptor: {response: parseResponseDates}},
             create: {method:'POST', params:{}, isArray:false},
             save: {method:'POST'}

            }
        );
    }]);

// See: http://stackoverflow.com/questions/18582900/usage-of-interceptor-within-resource
function parseResponseDates(response) {
    var data = response.data, key, value;
    console.log("parseRepsoneDates - called!");
    for (d in data) {
        console.log(data[d].title);
        convertDateStringsToDates(data[d]);
    }
    return data;
}


angular.module('app').config(["$resourceProvider", function ($resourceProvider) {
    $resourceProvider.defaults.transformResponse.push(function(responseData){
        convertDateStringsToDates(responseData);
        return responseData;
    });
}]);


/*
angular.module('app').config(['$resourceProvider', function($resourceProvider) {
    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);
*/