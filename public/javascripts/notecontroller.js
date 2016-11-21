angular.module('app').controller( "NoteDialogModalController",
    function( $scope, $http, modals,ImagePasteTarget ) {
        $scope.errObj = {serverError:""};
        $scope.fileActionRollbackMgr = null;
        $scope.mode = "VIEW"; // Can be VIEW or EDIT.
        $scope.params = modals.params();
        $scope.title = $scope.params.item.title.replace("*","");
        $scope.itemIndex = indexOfItem($scope.params.type,$scope.params.section,$scope.params.item);
        $scope.dismissText = "Close";
        $scope.go = modals.resolve;
        $scope.dismiss = modals.reject;

        $scope.htmlEdNote = translateToHtml($scope.params.item.note);
        $scope.editItem = null;

        $scope.edit = function() {
            $scope.editItem = angular.copy($scope.params.item);
            $scope.mode = "EDIT";
            ImagePasteTarget.assignCurrent('noteDlgPasteTargetID');
            $scope.fileActionRollbackMgr = new RollBackFileActionsMgr($http,$scope.errObj.serverError);
        };

        $scope.save = function() {
            if($scope.params.type === "ITEM_JUMP") {
                $scope.params.section.jumpItems[$scope.itemIndex] = $scope.editItem;
            } else { // must be ITEM_LINK;
                $scope.params.section.linkItems[$scope.itemIndex] = $scope.editItem;
            }
            $scope.fileActionRollbackMgr.processCommitDeletes();

            $scope.params.section.$save(function (section) {
                    $scope.htmlEdNote = translateToHtml($scope.editItem.note);
                    $scope.params.item = angular.copy($scope.editItem);
                    $scope.mode = "VIEW";
                },
                function (response) {
                    throw "Failed to save!"
                });
        };

        $scope.cancel = function() {
            $scope.fileActionRollbackMgr.processUndoAddsForRefSection();
            $scope.mode = "VIEW";
        };
    }
);

var translateToHtml = function(text) {
  var converter = new showdown.Converter();
  converter.setOption('tables',true);
  return converter.makeHtml(text);
};

var translateToHtmlOLDVERSION = function(text) {


    // Translate URL markdown to HTML <a>'s
    var re = /\[((\w|\s|[-])*?)\|(.*?)\]/gm
    var urlTagDetails = [],m;
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

    // Replace leading spaces with NBSP so that indentations are honoured.

    html = replaceLeadingSpaceWithNBSP(html);

    // Replace

    function replacer(match, p1, p2, offset, string) {
        return p1 + "<br/><br/>"
    }
    //html = html.replace(/([^>])(\r\n|\r|\n)/g, replacer);
    html = html.replace(/(^\s*)(\r\n|\r|\n)/g, replacer);
    return html;
};

var replaceLeadingSpaceWithNBSP = function(text) {
    var re = /^([ ]+)/gm, leadingSpaceMatches = [], m;
    while((m = re.exec(text))!== null) {
        var lsm = {
            leadSpcStr :m[1],
            pos:m.index,
            len:m[0].length
        };
        leadingSpaceMatches.push(lsm);
    }

    var result = "", offset = 0;
    for (var i in leadingSpaceMatches) {
         var lsm = leadingSpaceMatches[i];
         var nbsps = "" ; _(lsm.len).times(function(){nbsps+="&nbsp;"});
         result +=  text.slice(offset,lsm.pos) + nbsps;
         offset = lsm.pos + lsm.len;
    }
    result +=  text.slice(offset);
    return result;
}

// Find the index of the item in the section
function indexOfItem(type,section,item) {
    var index;
    if(type === "ITEM_JUMP") {
        index = _.indexOf(section.jumpItems,item);
    } else { // must be ITEM_LINK;
        index = _.indexOf(section.linkItems,item);
    }

    if (index === -1) {
        throw("Index not found for notes item: " + item.title + " section " + section.title);
    }
    return index;
}
