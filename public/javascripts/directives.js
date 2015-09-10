
angular.module('app')
    .directive('section', ['modals', function (modals) {
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
              scope.handleClickOnRef=function(event,item) {
                  dispatchClickRequest(event,item,modals);
              }
            }
        }
    }]);

// .directive('wtref', ['$timeout','modals', function ($timeout, modals) {

angular.module('app')
    .directive('sectionv', ['modals', function (modals) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'=',
                'edit':'=',
                'fold':'='
            },
            templateUrl: 'views-ng/sectionv.html',
            link: function postLink(scope, element, attrs) {
                scope.limit = scope.fold;
                scope.moreOrLess = "more...";
                scope.linkItemsLimit = scope.limit;

                scope.handleClickOnRef=function(event,item) {
                    dispatchClickRequest(event,item,modals);
                }

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

var dispatchClickRequest = function(event,item,modals)  {
  if(event.shiftKey && angular.isDefined(item.note)) {
      console.log("handleClickOnRef Called! - shiftKey");
      launchNotesModal(modals, item.title, item.note, item.link);
  } else if (event.ctrlKey) {
      console.log("handleClickOnRef Called! - ctrlKey");
  } else {
      if (angular.isDefined(item.link) && item.link.length > 0) {
          window.open(item.link);
      }
  }
}



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

var corePostLink = function(scope, element, attrs, $timeout, modals) {

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
      launchNotesModal(modals,element.text(), attrs.note, attrs.link);
    };

};


var launchNotesModal = function(modals ,pTitle, pNote, pLink) {

 var htmlEdNote = pNote.replace(/(?:\r\n|\r|\n)/g, '<br/>');

  var promise = modals.open(
      "noteDlg",
      {
          title:pTitle,
          link:pLink,
          note:htmlEdNote
      }
  );
  promise.then(
      function handleResolve( response ) {
          console.log( "Note Closes Resolve." );
          window.open(pLink,'_blank');
      },
      function handleReject( error ) {
          console.warn( "Note Closes reject." );
      }
  );
};


// See: http://stackoverflow.com/questions/18157305/angularjs-compiling-dynamic-html-strings-from-database
angular.module('app')
    .directive('dynamic', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, ele, attrs) {
                scope.$watch(attrs.dynamic, function(html) {
                    ele.html(html);
                    $compile(ele.contents())(scope);
                });
            }
        };
});


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
