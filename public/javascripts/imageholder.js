// The pasteimage expects there to be only one target. The PasteTarget settings
// services coordinates this and ensures that there is only one target and a give
// moment in time.
angular.module('app').service('ImagePasteTarget', function($window) {
    this.assignCurrent = function(pastTargetId) {
        $window.pasteTargetID=pastTargetId;
    };
});

angular.module('app')
    .directive('imageholder', ['$http', 'ImagePasteTarget', function ($http,ImagePasteTarget) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'mode':'=',
                'serverError':'=',
                'item':'=',
                'image':'=',
                'fileRollbackMgr' : '=',
                'pasteTargetId' : '='
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
                  // Showdown markup parsing is not able to cope with spaces in url paths.
                  // Also, append a random string of length 6 to ensure the file is unique.
                  scope.imageObj.fileName = scope.imageObj.fileName.replace(/\s+/g, '-') + "-" + randomString(6);
                  // alert(scope.imageObj.fileName);
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

// Appends the note text with a populated img tag for the current image.
var pasteImageTag = function(fileName,item) {
  // var imgTag = '\n <img class="twimgcenter" ng-src="/local/image/' + fileName + ' "height="150em"/> \n';

  var imgTag = "\n![image]"+"(/local/image/"+ fileName +" =800x*)\n"  // showdown syntax for an image.

  if (item.note === undefined) {
      item.note="";
  }
  item.note += imgTag;
};
