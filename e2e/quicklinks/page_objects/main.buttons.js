MainButtonsTHObj = {
    getMainButtons: function () {
        return element.all(by.tagName('button'));
    },
    getMainButtonWithID: function(elementId) {
        return element(by.id(elementId));
    }
};
module.exports = MainButtonsTHObj;
