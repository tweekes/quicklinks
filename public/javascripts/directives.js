angular.module('app')
    .directive('imageholder', ['$http',function ($http) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'mode':'=',
                'serverError':'=',
                'item':'=',
                'image':'=',
                'fileRollbackMgr' : '='
            },
            templateUrl: 'views-ng/imageholder.html',
            link: function postLink(scope, element, attrs) {
              scope.imageObj = {};
              scope.clear = function() {
                  scope.imageObj = {};
                  scope.serverError = "";
              };

              scope.pasteImageData = function(imageData) {
                  scope.clear();
                  scope.imageObj.dataUrl = imageData;
              };

              scope.save=function() {
                scope.serverError = "";
                if (scope.imageObj.dataUrl && scope.imageObj.fileName) {
                  $http.post('/local/uploadimage', scope.imageObj).
                    then(function(response) {
                      if (scope.item.images === undefined) {
                          scope.item.images = [];
                      }
                      var image = {fileName: response.data}; // The filename.
                      var item = scope.item;
                      scope.item.images.push(image);
                      // Just in case the user cancels we can then remove the file.
                      scope.fileRollbackMgr.addRollBackAction("UNDO_ADD",image,scope.item);
                      pasteImageTag(image.fileName,scope.item);
                      scope.clear();
                    }, function(response) {
                       scope.serverError = response.data;
                      // console.log("Post FAIL: " + JSON.stringify({data: response.data}) + " status: " + response.status);
                    });
                } else {
                    scope.serverError ="image not saved - image details have not been provided.";
                }
              };

              scope.cancel=function() {
                  scope.clear();
              };
              scope.delete=function() {
                  scope.fileRollbackMgr.addRollBackAction("COMMIT_DELETE", scope.image,scope.item);
                  var deleteIndex =
                      _.indexOf(scope.item.images, scope.image);
                  scope.item.images.splice(deleteIndex, 1);
                  scope.clear();
              };

              scope.copyUrl = function() {
                pasteImageTag(scope.image.fileName,scope.item);
              };
            }
        }
    }]);

var pasteImageTag = function(fileName,item) {
  var imgTag = '\n <img class="twimgcenter" ng-src="/local/image/' + fileName + ' "height="150em"/> \n';
  if (item.note === undefined) {
      item.note="";
  }
  item.note += imgTag;
};


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
              scope.handleClickOnRef=function(event,item,itemIndex) {
                  dispatchClickRequest(event,item,modals,$location,scope.edit,scope.sdata,"ITEM_JUMP",itemIndex);
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

                scope.handleClickOnRef=function(event,item,itemIndex,itemType) {
                    dispatchClickRequest(event,item,modals,$location,scope.edit,scope.sdata,itemType,itemIndex);
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

angular.module('app')
    .directive('searchresult', ['modals','$location', function (modals,$location) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'result':'=',
                'edit':'='
            },
            templateUrl: 'views-ng/searchresult.html',
            link: function postLink(scope, element, attrs) {
                scope.handleClickOnRef=function(event,item,section,itemIndex,itemType) {
                    dispatchClickRequest(event,item,modals,$location,scope.edit,section,itemType,itemIndex);
                }
            }
        }
    }]);


var dispatchClickRequest = function(event,item,modals,location,sectionEditFn,section,itemType,itemIndex)  {
  if(event.shiftKey && angular.isDefined(item.note) && item.note.length > 0) {
      launchNotesModal(modals,item,section);
  } else if (event.ctrlKey) {
      var selectedLinkItem = {itemType:itemType, rowIndex:itemIndex,item:item};
      sectionEditFn(section.key,selectedLinkItem);
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
};


var launchNotesModal = function(modals,item,section) {

  var promise = modals.open(
      "noteDlg",
      {
          item:item,
          section:section
      }
  );
  promise.then(

      // When the item has a link the user navigates to target page
      // when closing the notes dialog.
      function handleResolve( response ) {
          window.open(item.link,'_blank');
      },
      function handleReject( error ) {

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
