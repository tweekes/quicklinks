angular.module('app').service('ItemClipboard', function() {
    this.clipboard = null;  // {section, itemType, item}

    this.cut = function(item) {
        this.clipboard = item;
    }

    this.paste = function() {
        if (this.clipboard !== null) {

        }
    }

    this.state = function() {
        return this.clipboard;
    }
});
