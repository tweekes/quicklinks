
var putils = require('./page.utils');

module.exports = {
    addSection: function(td) {
        //  <li><a id="modeAddID" href="#" ng-click="modeChanged('Add')" >Add</a></li>
        element(by.id('modeDropDownID')).click();
        element(by.id('modeAddID')).click();
        expect(element(by.binding('mode')).getAttribute('textContent')).toBe('Add');
        element(by.model('currentRefSection.title')).sendKeys(td.title);
        putils.clearAndSendKeys(element(by.model('currentRefSection.key')),td.key);
        element(by.id('sectionTypeID')).click();
        element(by.linkText(td.type)).click();  // Horz or Vert
        if (td.type === "Horz") {
            putils.clearAndSendKeys(element(by.model('currentRefSection.sectionSize')), td.size);
        }
        putils.clearAndSendKeys(element(by.model('currentRefSection.sectionOrder')),td.order);
        element(by.id('sectionCommentID')).sendKeys(td.comment);
    },

    addJumpItem: function(td) {
        // ng-click="assignCurrent('jumpItemPasteTargetID')"
        // element(by.css('[ng-click="assignCurrent(\'jumpItemPasteTargetID\')"]')).click();
        //
        element(by.linkText('Jump List')).click();
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(element(by.model('tabJumpItemsCtx.selectedItem.title'))), 5000);

        element(by.model('tabJumpItemsCtx.selectedItem.title')).sendKeys(td.itemTitle);
        element(by.model('tabJumpItemsCtx.selectedItem.link')).sendKeys(td.itemLink);
        putils.clearAndSendKeys(element(by.model('tabJumpItemsCtx.selectedItem.order')),td.itemOrder);
        element(by.id('jumpItemNoteID')).sendKeys(td.itemNote);
        element(by.binding('tabJumpItemsCtx.verb')).click(); // click the Add button!
    },

    addLinkItem: function(td) {
        element(by.linkText('Links List')).click();
        var EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(element(by.model('tabLinkItemsCtx.selectedItem.title'))), 5000);
        element(by.model('tabLinkItemsCtx.selectedItem.title')).sendKeys(td.itemTitle);
        putils.clearAndSendKeys(element(by.model('tabLinkItemsCtx.selectedItem.order')),td.itemOrder);

        if (td.itemLink && td.itemLink.length > 0 ) {
            element(by.model('tabLinkItemsCtx.selectedItem.link')).sendKeys(td.itemLink);
        }
        if (td.itemNote && td.itemNote.length > 0 ) {
            element(by.linkText('Note')).click();
            element(by.id("linkList")).element(by.model('qcmodel')).sendKeys(td.itemNote);
        }

        if (td.hasOwnProperty('itemTodo') && td.itemTodo ) {
            element(by.model('tabLinkItemsCtx.selectedItem.hasTodo')).click();
            if (td.todoDueDate && td.todoDueDate.length > 0 && td.todoStartBy && td.todoStartBy.length > 0 ) {
                element(by.linkText('Todo Details')).click();
                element(by.model('tabLinkItemsCtx.selectedItem.todoInfo.due')).sendKeys(td.todoDueDate);
                element(by.model('tabLinkItemsCtx.selectedItem.todoInfo.startBy')).sendKeys(td.todoStartBy);
            }

            if (td.hasOwnProperty("todoDone") && td.todoDone) {
                element(by.model('tabLinkItemsCtx.selectedItem.todoInfo.done')).click();
            }

            if (td.hasOwnProperty("todoWaiting") && td.todoWaiting) {
                element(by.model('tabLinkItemsCtx.selectedItem.todoInfo.waiting')).click();
            }
        }
        element(by.binding('tabLinkItemsCtx.verb')).click(); // click the Add button!
    },

    cutLinkItem:function(){
        var criteria = '[ng-click="tabLinkItemsCtx.itemCut()"]'
        // putils.waitUntilElementIsVisible($(criteria));
        $(criteria).click();
    },

    pasteLinkItem: function() {
        element(by.linkText('Links List')).click();
        putils.waitUntilElementIsVisible($('[ng-click="tabLinkItemsCtx.itemPaste()"]')).click();
    },

    addMilestone: function(ms){
        // Miletone types: Start TDGRB TRIAGE ALC ETRB Release
        var statusMap = {'Required':0, 'Not Required':1, 'Done':2};
        element(by.linkText('Milestones')).click();

        var EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(element.all(by.binding('t.title')).get(0)), 5000);

        element.all(by.repeater('d in msMgr.milestones'))
            .get(ms.position)
            .element(by.model('d.date'))
            .sendKeys(ms.mdate);

        element.all(by.repeater('e in msMgr.milestones'))
            .get(ms.position)
            .all(by.model('e.status')).get(statusMap[ms.status])
            .click();

        $('[ng-click="msMgr.save()"]').click();
    },

    save: function() {
        var e = element(by.css('[ng-click="save()"]'));
        expect(e.isDisplayed()).toBe(true);
        e.click();
    },
    cancel: function() {
        var e = $('div.col-md-4.col-md-offset-9 > [ng-click="cancel()"]');
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
    },

    getCurrentSelectedItemFieldValue: function(field) {
        return element(by.model(field)).getAttribute("value");
    }

};
