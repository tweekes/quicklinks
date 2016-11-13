MainPageTHObj = {
    getVerticalRefSectionforTitle: function(refSectionTitle) {
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
    getRefSectionItem: function(sectionTitle, itemTitle) {
        var s =  this.getVerticalRefSectionforTitle(sectionTitle);
        var i = s.element(by.partialLinkText(itemTitle));
        expect(i.isPresent()).toBe(true);
        return i;
    },
    selectRefSectionForEdit: function(sectionTitle) {
        // <span ng-click="edit(sdata.key)" class="glyphicon glyphicon-pencil"></span>
        var s = this.getVerticalRefSectionforTitle(sectionTitle);
        var b = s.element(by.css('.glyphicon-pencil'));
        expect(b.isPresent()).toBe(true);
        return b;
    }
};

module.exports = MainPageTHObj;


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

