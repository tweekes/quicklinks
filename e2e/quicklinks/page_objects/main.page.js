var refSection = require('./refsection.edit.js');

module.exports = {
    getHorizontalRefSectionforTitle: function(refSectionTitle) {
        var sections =
            element.all(by.repeater('hrow in refHorizontalRows'))
                .all(by.repeater('section in hrow'))
                .filter(function (elem,index){
                    return elem.getAttribute("ID").then(function(value) {
                        return value === refSectionTitle;
                    });
                });
        expect(sections.count()).toBe(1);
        return sections.first();
    },
    getHorzRefSectionItem: function(sectionTitle, itemTitle) {
        var s =  this.getHorizontalRefSectionforTitle(sectionTitle);
        var i = s.element(by.partialLinkText(itemTitle));
        expect(i.isPresent()).toBe(true);
        return i;
    },
    selectHorzRefSectionForEdit: function(sectionTitle) {
        // <span ng-click="edit(sdata.key)" class="glyphicon glyphicon-pencil"></span>
        var s = this.getHorizontalRefSectionforTitle(sectionTitle);
        var b = s.element(by.css('.glyphicon-pencil'));
        expect(b.isPresent()).toBe(true);
        return b;
    },
    getVerticalRefSectionforTitle: function(refSectionTitle) {
        var sections =
            element.all(by.repeater('vrow in vrows'))
                .all(by.repeater('v in vrow'))
                .filter(function (elem,index){
                    return elem.element(by.binding('sdata.title'))
                        .getAttribute('textContent').then(function(value) {
                            return value === refSectionTitle;
                        });
                });
        expect(sections.count()).toBe(1);
        return sections.first();
    },
    selectVertRefSectionForEdit: function(sectionTitle) {
        // <span ng-click="edit(sdata.key)" class="glyphicon glyphicon-pencil"></span>
        var s = this.getVerticalRefSectionforTitle(sectionTitle);
        var b = s.element(by.css('.glyphicon-pencil'));
        expect(b.isPresent()).toBe(true);
        return b;
    },
    verticalSectionIsDisplayed: function(refSectionTitle) {
        return this.getVerticalRefSectionforTitle(refSectionTitle).isDisplayed();
    },
    itemIsDisplayed: function(itemTitle) {
        return element(by.partialLinkText(itemTitle)).isDisplayed();
    },

    getLinkItemElement: function(sectionTitle,itemTitle) {
        var vertSection = this.getVerticalRefSectionforTitle(sectionTitle);
        var linkItems = vertSection.all(by.repeater('item in sdata.linkItems'))
            .filter(function (elem,index){
                return elem.element(by.css('.twlinkitem'))
                    .getAttribute('textContent').then(function(text) {
                        // console.log("text: " + text + " itemTitle: " + itemTitle );
                        return text.trim() === itemTitle;
                    })
            });
        var linkItem = linkItems.first();
        return linkItem;
    },
    getLinkItemElements: function(sectionTitle) {
        var linkItems = this.getVerticalRefSectionforTitle(sectionTitle)
                              .all(by.repeater('item in sdata.linkItems'));
        return linkItems;
    },

    selectVertLinkItemForEdit: function(vertSectionName,linkItemTitle) {
        var linkElement = this.getLinkItemElement(vertSectionName,linkItemTitle).$('.twlinkitem');
        browser.actions()
            .mouseMove(linkElement)
            .keyDown(protractor.Key.CONTROL)
            .click()
            .perform();
        expect(refSection.getCurrentSelectedItemFieldValue('tabLinkItemsCtx.selectedItem.title')).toBe(linkItemTitle);
    },
    expectFacet: function(linkItem,facet) {
            if (facet === "isNote") {
                linkItem.element(by.css('.twlinkitem'))
                    .getAttribute('textContent').then(function(text) {
                        var s = text.trim();
                        var astericksExist = (s[s.length-1] === '*'); // is last characteris a '*' which is the note indicator.
                        expect(astericksExist).toBe(true);
                });
            } else if (facet === "isLink") {
                // There should be one anchor tag.
                expect(linkItem.all(by.css('a')).count()).toBe(1);
            } else if (facet === "isTodo") {
                expect(linkItem.all(by.css('.todoCB')).count()).toBe(1);
            } else if (facet === "isTodoDone") {
                expect(linkItem.all(by.css('.twdone')).count()).toBe(1);
            } else if (facet === "isTodoCurrent") { // is orange
                expect(linkItem.all(by.css('.todoCbORANGE')).count()).toBe(1);
            } else if (facet === "isTodoOverDue") { // is red
                expect(linkItem.all(by.css('.todoCbRED')).count()).toBe(1);
            }
    },

    // Expands / contracts ref section link item list. - more... / ...less
    verticalSectionExpandLinkItemList: function(refSectionTitle) {
        var sectionElement = this.getVerticalRefSectionforTitle(refSectionTitle);
        sectionElement.element(by.css('[ng-click="toggleDisplayLimit()"]')).click();
    },

    getMilestoneHeadings: function(refSectioTitle) {
        var headings =
        this.getVerticalRefSectionforTitle(refSectioTitle)
            .$('thead')
            .all(by.repeater('m in sdata.milestones'));
        expect(headings.count()).toBe(6);
        return headings;
    },
    getMilestoneDates: function(refSectioTitle) {
        var dates =
        this.getVerticalRefSectionforTitle(refSectioTitle)
            .$('tbody')
            .all(by.repeater('m in sdata.milestones'));
        expect(dates.count()).toBe(6);
        return dates;
    }

};


/*
 by.addLocator('refitem',
 function(titleText, opt_parentElement, opt_rootSelector) {
 var using = opt_parentElement,
 refItems = using.querySelectorAll('a');

 // Return an array of refitems with the titleText.
 return Array.prototype.filter.call(refItems, function(refItem) {
 return refItem.textContent === titleText;
 });
 });
 */

