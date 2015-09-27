angular.module('app').controller( "NoteDialogModalController",
    function( $scope, modals ) {
        $scope.mode = "VIEW"; // Can be VIEW or EDIT.
        $scope.params = modals.params();
        $scope.title = $scope.params.item.title.replace("*","");
        $scope.dismissText = "Close";
        $scope.go = modals.resolve;
        $scope.dismiss = modals.reject;
        $scope.htmlEdNote = translateToHtml($scope.params.item.note );

        $scope.edit = function() {
            $scope.mode = "EDIT";
        };

        $scope.save = function() {
            $scope.params.section.$save(function (response) {
                    $scope.htmlEdNote = translateToHtml($scope.params.item.note);
                    $scope.mode = "VIEW";
                },
                function (response) {
                    throw "Failed to save!"
                });
        };
    }
);

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