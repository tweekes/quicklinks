angular.module('app').service(
    "TemplateUtils", function() {
        return ({
            titleWithNoteIndicator: titleWithNoteIndicator
        });
        // Appends an astericks to the title text if the item has a note.
    });

function titleWithNoteIndicator(item) {
    var t = item.title;
    if (angular.isDefined(item.note) && item.note.length > 0) {
        t = item.title + "*";
    }
    return t;
};
