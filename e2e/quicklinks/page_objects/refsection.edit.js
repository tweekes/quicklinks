RefSectionEditTHObj = {
    addSection: function(td) {
        //  <li><a id="modeAddID" href="#" ng-click="modeChanged('Add')" >Add</a></li>
        element(by.id('modeDropDownID')).click();
        element(by.id('modeAddID')).click();
        expect(element(by.binding('mode')).getAttribute('textContent')).toBe('Add');
        element(by.model('currentRefSection.title')).sendKeys(td.title);
        clearAndSendKeys(element(by.model('currentRefSection.key')),td.key);
        element(by.id('sectionTypeID')).click();
        element(by.linkText(td.type)).click();  // Horz or Vert
        clearAndSendKeys(element(by.model('currentRefSection.sectionSize')),td.size);
        clearAndSendKeys(element(by.model('currentRefSection.sectionOrder')),td.order);
        element(by.id('sectionCommentID')).sendKeys(td.comment);
    },

    addJumpItem: function(td) {
        // ng-click="assignCurrent('jumpItemPasteTargetID')"
        // element(by.css('[ng-click="assignCurrent(\'jumpItemPasteTargetID\')"]')).click();
        //
        element(by.linkText('Jump List')).click();
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(element(by.model('tabJumpItemsCtx.selectedItem.title'))), 5000);

        // browser.pause();
        element(by.model('tabJumpItemsCtx.selectedItem.title')).sendKeys(td.itemTitle);
        element(by.model('tabJumpItemsCtx.selectedItem.link')).sendKeys(td.itemLink);
        clearAndSendKeys(element(by.model('tabJumpItemsCtx.selectedItem.order')),td.itemOrder);
        element(by.id('jumpItemNoteID')).sendKeys(td.itemNote);
        element(by.binding('tabJumpItemsCtx.verb')).click(); // click the Add button!
    },

    addLinkItem: function() {

    },

    save: function() {
        var e = element(by.css('[ng-click="save()"]'));
        expect(e.isDisplayed()).toBe(true);
        e.click();
    },
    delete: function() {
        element(by.css('[ng-click="delete()"]')).click();
        browser.waitForAngular();
        // Confirmation is presented, so select ok.
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.elementToBeClickable(element(by.buttonText("OK"))), 5000);
        element(by.buttonText("OK")).click();
    },

    // Select one of "Comment", "Jump List", "Links List" or "Milestone" tab
    selectTab: function(tabName) {
        element(by.linkText(tabName)).click();
    },

    selectItemWithTitle: function(title,expectToFind) {
        var items = element.all(by.repeater('ii in currentRefSection.jumpItems'))
            .filter(function (elem,index){
                var titleTableCell = elem.element(by.css('td:nth-child(1)'));
                return titleTableCell.getAttribute("textContent").then(function(value) {
                    return value === title;
                });
            });
        if (expectToFind) {

            var selectedRow = items.first();
            browser.waitForAngular();
            expect(items.count()).toBe(1);
            selectedRow.element(by.css('td:nth-child(5) input[type=checkbox]')).click();
        } else {
            expect(items.count()).toBe(0);
        }
    },

    // delete the current selected item
    itemDelete: function() {
        element(by.css('[ng-click="tabJumpItemsCtx.itemDelete(currentRefSection.jumpItems)"]')).click();
    }
};

module.exports = RefSectionEditTHObj;