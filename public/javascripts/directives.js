
angular.module('app')
    .directive('section', ['modals','$location', function (modals,$location) {
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
              scope.handleClickOnRef=function(event,item,refSectionKey,itemIndex) {
                  dispatchClickRequest(event,item,modals,$location,scope.edit,refSectionKey,"ITEM_JUMP",itemIndex);
              }
            }
        }
    }]);

// .directive('wtref', ['$timeout','modals', function ($timeout, modals) {

angular.module('app')
    .directive('sectionv', ['modals','$location', function (modals,$location) {
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

                scope.handleClickOnRef=function(event,item,refSectionKey,itemIndex,itemType) {
                    dispatchClickRequest(event,item,modals,$location,scope.edit,refSectionKey,itemType,itemIndex);
                };

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

var dispatchClickRequest = function(event,item,modals,location,sectionEditFn,refSectionKey,itemType,itemIndex)  {
  if(event.shiftKey && angular.isDefined(item.note) && item.note.length > 0) {
      launchNotesModal(modals, item.title, item.note, item.link);
  } else if (event.ctrlKey) {
      var selectedLinkItem = {itemType:itemType, rowIndex:itemIndex,item:item};
      sectionEditFn(refSectionKey,selectedLinkItem);
  } else {
      if (angular.isDefined(item.link) && item.link.length > 0) {
          var link = stripQuotes(item.link); // As convenience allow Windows qouted paths.
          var re = /^([a-zA-Z]:)?(\\[^<>:"/\\|?*]+)+\\?$/;
          if (link.search(re) != -1) {
              var u = "http://"+ location.host()+':'+location.port() + '/local/download?fpath='+ link;
              window.open(u);
          } else {
              window.open(link);
          }
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
  var htmlEdNote = translateToHtml(pNote);
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

var stripQuotes = function(str) {
  var re = /^"(.*)"$/;
  var r,m;
  if ( (m = re.exec(str)) == null) {
    r = str; // No stripping to be done.
  } else {
    r = m[1];
  }
  return r;
}

var translateToHtml = function(text) {
  var re = /\[((\w|\s)*?)\|(.*?)\]/gm
  var urlTagDetails = [];
  while((m = re.exec(text)) !== null) {
      var urlTagDetail = {
        name:m[1],
        url:m[3],
        pos:m.index,
        tagLength:m[0].length,
        anchor:'<a href="' + m[3] + '" target="_blank">' + m[1] + '</a>'
      };
      urlTagDetails.push(urlTagDetail);
  }

  var html = ""
  var offset = 0;
  for (var i in urlTagDetails) {
    var u = urlTagDetails[i];
    html += text.slice(offset,u.pos) + u.anchor;
    offset = u.pos + u.tagLength;
  }
  html += text.slice(offset);
  html = html.replace(/(?:\r\n|\r|\n)/g, '<br/>');
  return html;
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
