
angular.module('app')
    .directive('section', [ function () {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'='
            },
            templateUrl: 'views-ng/section.html',
            link: function postLink(scope, element, attrs) {

            }
        }
    }]);


angular.module('app')
    .directive('wtproj', ['$compile',function ($compile) {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                'task':'@'
            },
            template: "<h4 ng-transclude></h4>"
        }
    }]);


angular.module('app')
    .directive('wtref', ['$timeout','modals', function ($timeout, modals) {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                'title':'@',
                'link':'@',
                'note':'@'
            },
            // template: '<a style="display: block;" href="{{link}}" target="_self"  ng-mouseenter="enter()" ng-mouseleave="leave()" ng-click="leave()" ng-transclude> </a>',
            templateUrl: 'views-ng/wtref.html',
            link: function postLink(scope, element, attrs) {
                corePostLink(scope, element, attrs, $timeout,modals);
            }

        }
    }]);


angular.module('app')
    .directive('wtjump', ['$timeout','modals', function ($timeout, modals) {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                'title':'@',
                'link':'@',
                'note':'@'
            },
            templateUrl:'views-ng/wtjump.html',
            link: function postLink(scope, element, attrs) {
                corePostLink(scope, element, attrs, $timeout,modals);
            }
        }
    }]);

var corePostLink = function(scope, element, attrs,$timeout, modals) {

    scope.timeout = 0;
    scope.enter = function() {
        scope.timeout = $timeout(function() {
            if (attrs.note !== undefined && attrs.note !="") {
                scope.launch();
            }
        }, 900)
    };
    scope.leave = function() {
        if (scope.timeout) $timeout.cancel(scope.timeout);
    };

    scope.launch = function(){
        var promise = modals.open(
            "noteDlg",
            {
                title:element.text(),
                link:attrs.link,
                note:attrs.note
            }
        );
        promise.then(
            function handleResolve( response ) {
                console.log( "Note Closes Resolve." );
                window.open(attrs.link,'_blank');
            },
            function handleReject( error ) {
                console.warn( "Note Closes reject." );
            }
        );
    };

};

/* <wtmilestones start="01/01/15" tdgrb="22/04/15" asgp="20/04/15" alc="15/05/15" etrb="25/05/15" release="01/11/15"></wtmilestones>  */
angular.module('app')
    .directive('wtmilestones', [function () {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                'start':'@',
                'tdgrb':'@',
                'asgp':'@',
                'alc':'@',
                'etrb':'@',
                'release':'@'
            },
            template: 	'<div>'+
            '<p></p>'+
            '<table class="table table-condensed" style="font-size:11px;">'+
            '<thead>'+
            '<tr>'+
            '<th>Start</th>'+
            '<th>TDGRB</th>'+
            '<th>ASGP</th>'+
            '<th>ALC</th>'+
            '<th>ETRB</th>'+
            '<th>Release</th>'+
            '</tr>'+
            '</thead>'+
            '<tbody>'+
            '<tr>'+
            '<td>{{start}}</td>'+
            '<td>{{tdgrb}}</td>'+
            '<td>{{asgp}}</td>'+
            '<td>{{alc}}</td>'+
            '<td>{{etrb}}</td>'+
            '<td>{{release}}</td>'+
            '</tr>'+
            '</tbody>'+
            '</table>'+
            '</div>',
            link: function postLink(scope, element, attrs) {

            }
        }
    }]);


angular.module('app')
    .directive('ruler', [function () {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            template:
            '<div class="row">'+
                '<div class="col-md-1 twcola">1</div>'+
                '<div class="col-md-1 twcolb">2</div>'+
                '<div class="col-md-1 twcolc">3</div>'+
                '<div class="col-md-1 twcola">4</div>'+
                '<div class="col-md-1 twcolb">5</div>'+
                '<div class="col-md-1 twcolc">6</div>'+
                '<div class="col-md-1 twcola">7</div>'+
                '<div class="col-md-1 twcolb">8</div>'+
                '<div class="col-md-1 twcolc">9</div>'+
                '<div class="col-md-1 twcola">10</div>'+
                '<div class="col-md-1 twcolb">11</div>'+
                '<div class="col-md-1 twcolc">12</div>'+
            '</div>',
            link: function postLink(scope, element, attrs) {

            }
        }
    }]);