var mainButtons = require('./page_objects/main.buttons.js');

describe('Quick Link E2E Test', function() {

    var refSection = require('./page_objects/refsection.edit.js');
    var mainPage = require('./page_objects/main.page.js');

    beforeEach(function() {
        browser.get('http://localhost:3010/');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Quick Links');
    });

    it('should have 4 main buttons on index.html', function() {
        expect(mainButtons.getMainButtons().count()).toEqual(4);
        expect(mainButtons.getMainButtonWithID('mainButtonSettinsID').isPresent()).toBe(true);
        expect(mainButtons.getMainButtonWithID('mainButtonSearchID').isPresent()).toBe(true);
        expect(mainButtons.getMainButtonWithID('mainButtonTodoDashboardID').isPresent()).toBe(true);
        expect(mainButtons.getMainButtonWithID('mainButtonSetupID').isPresent()).toBe(true);
    });

    it('add a section', function() {
        mainButtons.getMainButtonWithID('mainButtonSetupID').click();
        refSection.addSection({
            title:"Second Section from E2E 2",
            key:"1",
            size:"3",
            order:"1",
            type:"Horz",
            comment:"This is a comment from the E2E test script"
        });
        refSection.addJumpItem({
            itemTitle:'Google',
            itemLink:'http://www.google.ie',
            itemOrder:'1',
            itemNote:'This is a note for the google jump item'
        });
       refSection.addJumpItem({
            itemTitle:'Yahoo',
            itemLink:'http://www.yahoo.com',
            itemOrder:'2',
            itemNote:''
        });
        refSection.save();

        var s =  mainPage.getVerticalRefSectionforTitle('Second Section from E2E 2');
        expect(s.isDisplayed()).toBe(true);

        var t = mainPage.getRefSectionItem('Second Section from E2E 2','Google');
        expect(t.isDisplayed()).toBe(true);

        var t = mainPage.getRefSectionItem('Second Section from E2E 2','Yahoo');
        expect(t.isDisplayed()).toBe(true);
    });

    it('delete jump item', function() {
        mainPage.selectRefSectionForEdit('Second Section from E2E 2').click();
        refSection.selectTab("Jump List");
        refSection.selectItemWithTitle("Yahoo",true); // expectToFind = true
        refSection.itemDelete();
        refSection.save();

        // Now check tha the delete worked "Yahoo" should not exist now!
        mainPage.selectRefSectionForEdit('Second Section from E2E 2').click();
        refSection.selectItemWithTitle("Yahoo",false); // expectToFind = false
    });

    it('delete horizontal section', function() {
        mainPage.selectRefSectionForEdit('Second Section from E2E 2').click();
        refSection.delete();
    });
});





