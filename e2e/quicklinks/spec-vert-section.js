describe('Vert Section Tests', function() {
    var mainButtons = require('./page_objects/main.buttons.js');
    var refSection = require('./page_objects/refsection.edit.js');
    var mainPage = require('./page_objects/main.page.js');
    var noteDialog = require('./page_objects/note.dialog');
    var todoDashboard = require('./page_objects/tododashboard');
    var pageUtils = require('./page_objects/page.utils');
    var moment = require('../../public/vendor/moment');

    beforeEach(function() {
        browser.get('http://localhost:3010/');
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10010;
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Quick Links');
    });

    it('add a section', function() {
        mainButtons.getMainButtonWithID('mainButtonSetupID').click();
        refSection.addSection({
            title: "Vertical Section 1",
            key: "1",
            size: "777",
            order: "1",
            type: "Vert",
            comment: "Vertical Section comment"
        });
        refSection.save();
        var s =  mainPage.getVerticalRefSectionforTitle('Vertical Section 1');
        expect(s.isDisplayed()).toBe(true);
    });

    it('can have jump items',function(){
        // pending("On hold while we get link items test created!");
        mainPage.selectVertRefSectionForEdit('Vertical Section 1').click();

        refSection.addJumpItem({
            itemTitle:'VRST Google',  // VRST ::= Vertical Ref Section Test
            itemLink:'http://www.google.ie',
            itemOrder:'1',
            itemNote:'This is a note for the google jump item'
        });
       refSection.addJumpItem({
            itemTitle:'VRST Yahoo',
            itemLink:'http://www.yahoo.com',
            itemOrder:'2',
            itemNote:''
        });
        refSection.save();

        expect(mainPage.itemIsDisplayed('VRST Google')).toBe(true);
        expect(mainPage.itemIsDisplayed('VRST Yahoo')).toBe(true);
    });

    //.pend("O N   H O L D  while link test being constructed");

    it('can have link items',function(){
        mainPage.selectVertRefSectionForEdit('Vertical Section 1').click();
        refSection.addLinkItem({
            itemTitle:'Item Plain', // with no link or not and is not a todo.
            itemOrder:'1'
        });

        refSection.addLinkItem({
            itemTitle:'Item with Link',
            itemLink:'http://www.google.ie',
            itemOrder:'2'
        });

        refSection.addLinkItem({
            itemTitle:'Item with Link and Note',
            itemLink:'http://www.google.ie',
            itemOrder:'3',
            itemNote:'This is a note.'
        });

        refSection.addLinkItem({
            itemTitle:'Item with Link and Note is a Todo item',
            itemLink:'http://www.google.ie',
            itemOrder:'4',
            itemNote:'This is a note - item is a todo',
            itemTodo:true
        });

        // moment JS used. moment() ::= now, .format('L') ::= e.g. "07/11/2015"
        var start = moment(), due = start.clone().add(3, 'days');
        refSection.addLinkItem({
            itemTitle:'Todo Item is Current - orange',
            itemOrder:'5',
            itemTodo:true, todoStartBy:start.format(pageUtils.dateFmt), todoDueDate:due.format(pageUtils.dateFmt)
        });

        var pastStart = moment().subtract(10,'days'), pastDue = pastStart.clone().add(3,'days');
        refSection.addLinkItem({
            itemTitle:'Todo item is over due - red',
            itemOrder:'6',
            itemTodo:true, todoStartBy:pastStart.format(pageUtils.dateFmt), todoDueDate:pastDue.format(pageUtils.dateFmt)
        });

        refSection.addLinkItem({
            itemTitle:'Todo completed',
            itemOrder:'7',
            itemTodo:true, todoDone:true
        });
        refSection.addLinkItem({
            itemTitle:'Todo with waiting status',
            itemOrder:'8',
            itemTodo:true, todoWaiting:true
        });
        // browser.pause();
        refSection.save();

        /*
         *  Now assert that the created ref section items are now presented on the main page.
         */
        expect(mainPage.verticalSectionIsDisplayed('Vertical Section 1')).toBe(true);
        mainPage.verticalSectionExpandLinkItemList('Vertical Section 1');

        // Jist calling the get will verify that the section is displayed.
        var linkItemElem = mainPage.getLinkItemElement('Vertical Section 1','Item Plain');
        expect(linkItemElem.isDisplayed()).toBe(true);


        var linkItemElemA  =  mainPage.getLinkItemElement('Vertical Section 1', 'Item with Link');
        mainPage.expectFacet(linkItemElemA,'isLink');

        var linkItemElemB  =  mainPage.getLinkItemElement('Vertical Section 1',  'Item with Link and Note*');
        mainPage.expectFacet(linkItemElemB,'isLink');
        mainPage.expectFacet(linkItemElemB,'isNote');

        var linkItemElemC =  mainPage.getLinkItemElement('Vertical Section 1','Item with Link and Note is a Todo item*');
        mainPage.expectFacet(linkItemElemC,'isNote');
        mainPage.expectFacet(linkItemElemC,'isLink');
        mainPage.expectFacet(linkItemElemC,'isTodo');

        var linkItemElemD =  mainPage.getLinkItemElement('Vertical Section 1','Todo Item is Current - orange');
        mainPage.expectFacet(linkItemElemD,'isTodoCurrent');

        var linkItemElemE =  mainPage.getLinkItemElement('Vertical Section 1','Todo item is over due - red');
        mainPage.expectFacet(linkItemElemE,'isTodoOverDue');

        var linkItemElemF =  mainPage.getLinkItemElement('Vertical Section 1','Todo completed');
        mainPage.expectFacet(linkItemElemF,'isTodoDone');

    });

    // Simulate CTRL + Click to open edit with the selected link details active for edit.
    it("direct edit on link item", function() {
        var linkElement = mainPage.getLinkItemElement('Vertical Section 1','Item Plain').$('.twlinkitem');
        expect(linkElement.isDisplayed()).toBe(true);

        browser.actions()
            .mouseMove(linkElement)
            .keyDown(protractor.Key.CONTROL)
            .click()
            .perform();

        // ng-model="tabLinkItemsCtx.selectedItem.title" assert Item Plain
        expect(refSection.getCurrentSelectedItemFieldValue('tabLinkItemsCtx.selectedItem.title')).toBe('Item Plain');
        // browser.pause();
    });

    it("open note on link item with note", function() {
        var linkElement = mainPage.getLinkItemElement('Vertical Section 1','Item with Link and Note*').$('.twlinkitem');
        expect(linkElement.isDisplayed()).toBe(true);
        browser.actions()
            .mouseMove(linkElement)
            .keyDown(protractor.Key.SHIFT)
            .click()
            .perform();
        expect(noteDialog.retriveNoteText()).toBe('This is a note.');
    });

    it("create milestones", function(){
        // Miletone types: Start TDGRB TRIAGE ALC ETRB Release
        mainPage.selectVertRefSectionForEdit('Vertical Section 1').click();
        refSection.addMilestone({
            position: 0,
            title: 'Start',
            mdate: '14012015',
            status: "Done" // Can be 'Required', 'Not Required', or 'Done'
        });

        refSection.addMilestone({
            position: 1,
            title: 'TDGRB',
            mdate: '14032015',
            status: "Done" // Can be 'Required', 'Not Required', or 'Done'
        });

        refSection.addMilestone({
            position: 2,
            title: 'TRIAGE',
            mdate: '14032015',
            status: "Required" // Can be 'Required', 'Not Required', or 'Done'
        });
        refSection.addMilestone({
            position: 3,
            title: 'ALC',
            mdate: '14052015',
            status: "Not Required" // Can be 'Required', 'Not Required', or 'Done'
        });
        refSection.addMilestone({
            position: 4,
            title: 'ETRB',
            mdate: '14052015',
            status: "Not Required" // Can be 'Required', 'Not Required', or 'Done'
        });
        refSection.addMilestone({
            position: 5,
            title: 'Release',
            mdate: '14082015',
            status: "Required" // Can be 'Required', 'Not Required', or 'Done'
        });

        refSection.save();

        // No check that the milestone is displayed on the main page
        var mh = mainPage.getMilestoneHeadings('Vertical Section 1');
        expect(mh.get(0).getAttribute('textContent')).toBe('Start');
        expect(mh.get(1).getAttribute('textContent')).toBe('TDGRB');
        expect(mh.get(2).getAttribute('textContent')).toBe('TRIAGE');
        expect(mh.get(3).getAttribute('textContent')).toBe('ALC');
        expect(mh.get(4).getAttribute('textContent')).toBe('ETRB');
        expect(mh.get(5).getAttribute('textContent')).toBe('Release');


        var md = mainPage.getMilestoneDates('Vertical Section 1');
        // expect(md.get(0).getAttribute('textContent')).toMatch( /^(\s| )*1\/14\/15.*/);
        expect(md.get(1).getAttribute('textContent')).toMatch( /^(\s| )*3\/14\/15.*/);
        expect(md.get(2).getAttribute('textContent')).toMatch( /^(\s| )*3\/14\/15.*/);
        expect(md.get(3).getAttribute('textContent')).toMatch( /^(\s| )*n\/a*/);
        expect(md.get(4).getAttribute('textContent')).toMatch( /^(\s| )*n\/a*/);
        expect(md.get(5).getAttribute('textContent')).toMatch( /^(\s| )*8\/14\/15*/);


        mainPage.selectVertRefSectionForEdit('Vertical Section 1').click();
        refSection.delete();

    });


    it('copy paste link item from one section to another',function() {
        mainButtons.getMainButtonWithID('mainButtonSetupID').click();
        refSection.addSection({
            title: "Vert Section - With Source Link Item",
            key: "1",
            size: "777",
            order: "1",
            type: "Vert",
            comment: "section with source link item."
        });

        refSection.addLinkItem({
            itemTitle:'Link Item on the Move', // with no link or not and is not a todo.
            itemOrder:'1'
        });
        refSection.save();

        var s1 =  mainPage.getVerticalRefSectionforTitle('Vert Section - With Source Link Item');
        expect(s1.isDisplayed()).toBe(true);

        mainButtons.getMainButtonWithID('mainButtonSetupID').click();
        refSection.addSection({
            title: "Vert Section - Target Link Item",
            key: "2",
            size: "777",
            order: "2",
            type: "Vert",
            comment: "section for target link item."
        });
        refSection.save();
        var s2 =  mainPage.getVerticalRefSectionforTitle('Vert Section - Target Link Item');
        expect(s2.isDisplayed()).toBe(true);

        mainPage.selectVertLinkItemForEdit('Vert Section - With Source Link Item','Link Item on the Move');
        refSection.cutLinkItem();
        refSection.cancel();

        mainPage.selectVertRefSectionForEdit("Vert Section - Target Link Item").click();

        refSection.pasteLinkItem();
        refSection.save();

        var linkItemA = mainPage.getLinkItemElement('Vert Section - Target Link Item','Link Item on the Move');
        expect(linkItemA.isDisplayed()).toBe(true);

        // Now confirm that the link item is no longer on the source Ref Section
        expect(mainPage.getLinkItemElements('Vert Section - With Source Link Item').count()).toBe(0);

        mainPage.selectVertRefSectionForEdit('Vert Section - With Source Link Item').click();
        refSection.delete();

        mainPage.selectVertRefSectionForEdit('Vert Section - Target Link Item').click();
        refSection.delete();
    },10000);


    xit('link items with todo facet are presented in Todo Dashboard',function(){

        var setup = function() {
            mainButtons.getMainButtonWithID('mainButtonSetupID').click();

            refSection.addSection({
                title: "Vert Sect TODO Tests",
                key: "1",
                order: "100",
                type: "Vert",
                comment: "Vertical sections for the Todo Dash Board Tests"
            });

            //  dateFmt: "DD/MM/YYYY",  pastStart.format(pageUtils.dateFmt)
            // var pastStart = moment().subtract(10,'days'), pastDue = pastStart.clone().add(3,'days');
            refSection.addLinkItem({
                itemTitle:'Long term todo',
                itemOrder:'1',
                itemTodo:true, todoStartBy:'20/12/2020', todoDueDate:'31/12/2020'
            });

            refSection.addLinkItem({
                itemTitle:'A Waiting todo',
                itemOrder:'2',
                itemTodo:true, todoWaiting:true
            });

            // moment JS used. moment() ::= now, .format('L') ::= e.g. "07/11/2015"
            var start = moment(), due = start.clone().add(3, 'days');
            refSection.addLinkItem({
                itemTitle:'A Current Todo A - Orange',
                itemOrder:'3',
                itemTodo:true, todoStartBy:start.format(pageUtils.dateFmt), todoDueDate:due.format(pageUtils.dateFmt)
            });

            var pastStart = moment().subtract(10,'days'), pastDue = pastStart.clone().add(3,'days');
            refSection.addLinkItem({
                itemTitle:'A Current Todo B - Red',
                itemOrder:'4',
                itemTodo:true, todoStartBy:pastStart.format(pageUtils.dateFmt), todoDueDate:pastDue.format(pageUtils.dateFmt)
            });

            refSection.addLinkItem({
                itemTitle:'Todo completed',
                itemOrder:'5',
                itemTodo:true, todoDone:true
            });
            refSection.save();
        }

        setup();
        mainButtons.getMainButtonWithID('mainButtonTodoDashboardID').click();
        expect(todoDashboard.getTotalTodos()).toBe('(5)');
        expect(todoDashboard.getWithTodoStatus()).toBe('(1)');
        expect(todoDashboard.getWithWaitingStatus()).toBe('(1)');
        expect(todoDashboard.getWithCurrentStatus()).toBe('(2)');
        expect(todoDashboard.getWithDoneStatus()).toBe('(1)');
        todoDashboard.closeDashboard();
        mainPage.selectVertRefSectionForEdit('Vert Sect TODO Tests').click();
        refSection.delete();
    },10000);

});





