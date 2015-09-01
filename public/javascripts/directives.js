
angular.module('app')
    .directive('section', [ function () {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'=',
                'edit':'='
            },
            templateUrl: 'views-ng/section.html',
            link: function postLink(scope, element, attrs) {

            }
        }
    }]);

angular.module('app')
    .directive('sectionv', [ function () {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'=',
                'edit':'='
            },
            templateUrl: 'views-ng/sectionv.html',
            link: function postLink(scope, element, attrs) {
                scope.limit = 10;
                scope.moreOrLess = "more...";
                scope.linkItemsLimit = scope.limit;

                scope.toggleDisplayLimit = function() {
                    if (scope.linkItemsLimit === undefined) {
                        scope.linkItemsLimit = scope.limit;
                        scope.moreOrLess = "more...";
                    } else {
                        scope.linkItemsLimit = undefined;
                        scope.moreOrLess = "...less";
                    }
                }
            }
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
