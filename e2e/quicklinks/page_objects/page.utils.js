module.exports = {
    // Utilities - refactor to separate file later.
    clearAndSendKeys: function clearAndSendKeys(el,value) {
        el.clear();
        el.sendKeys(value);
    },

    dateFmt: "DD/MM/YYYY",

    waitUntilElementIsVisible: function(elem) {
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(elem), 4000);
        return elem;
    }

};
