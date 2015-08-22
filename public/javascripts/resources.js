
angular.module('app')
    .factory('RefDA',['$resource', function($resource) {
        // See page 110 of AngularJS book.
        // https://docs.angularjs.org/api/ngResource/service/$resource
        return $resource('/model/qlinks/:refId',
            {refId:'@_id'},
            {
            //  query: {method:'GET', isArray: true, interceptor: {response: parseResponseDates}},
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

       //if (!data.hasOwnProperty(key) && // don't parse prototype or non-string props
          //  toString.call(data[key]) !== '[object String]') continue;
        // value = Date.parse(data[key]); // try to parse to date
        // if (value !== NaN) data[key] = value;
    }
    return response;
}
