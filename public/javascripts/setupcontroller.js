angular.module('app').controller(
    "SetupModalController",
    function( $scope, modals, RefDA, $http, ItemClipboard, ImagePasteTarget) {
        $scope.errObj = {serverError:""};
        $scope.fileActionRollbackMgr = null;
        $scope.mode = "Edit";  // Over all mode for dialog, can be Add or Edit.
        $scope.tabJumpItemsCtx = null; $scope.tabLinkItemsCtx = null;

        $scope.msMgr = new MilestonesMgr;
        $scope.saveReady = false;
        $scope.dirtyDataIndicator = false;
        $scope.selectedRefSection = null;
        $scope.currentRefSection = undefined;
        $scope.activeTab = 'COMMENT'; // Can be COMMENT, LINK, JUMP, or MILESTONE
        $scope.activeLinkItemDetailsTab = 'NOTE'; // Can be NOTE, IMAGE, or TODO
        var dereg = $scope.$watch('currentRefSection',dirtyDataCheck,true);
        // Used to communicate flags etc back to the parent controller.
        $scope.responseParams = {};

        // $scope.sectionType Can be Horz ::= section will for jumpitems and will placed at the
        // top of the screen. Or can be Vert ::= section will contain Jumpitem linkItems, milestones.
        $scope.sectionType = "Vert";

        // Setup defaults using the modal params.
        var params = modals.params();
        $scope.refSections = params.refSections;
        $scope.appSettings = params.appSettings;

        $scope.modeChanged = function(m) {
            if(m === 'Add' && $scope.mode !== "Add") {
                $scope.currentRefSection = createReferenceInstance(RefDA);
                $scope.currentRefSectionChanged();
            }

            if(m === 'Edit' && $scope.mode !== "Edit") {
                $scope.currentRefSection = undefined;
                $scope.saveReady = false;
            }

            $scope.mode = m;
        };

        $scope.titleChanged = function() {
            $scope.currentRefSection.key = generateKeyFromTitle($scope.currentRefSection.title);
        };

        $scope.titleFieldLeave = function() {
          // We only want to see if a similar refsection exists when in ADD mode.
          if ($scope.mode === "Add") {
            var existingRefSections = []; // Bootbox, needs format: [ { text: 'some descritopn', value: 'technicalkey'}]
            _.each(candidates($scope.refSections,$scope.currentRefSection.title), function(c){
              var x = {text:c.title,value:c.key};
              existingRefSections.push(x);
            });
            bootbox.prompt({
                title: "Before creating a new section, does one with a similar title already exist?",
                inputType: 'select',
                inputOptions: existingRefSections,
                callback: function (existingKey) {
                    if (existingKey !== null) {
                      $scope.mode = "Edit";
                      $scope.initialize(existingKey, null, null);
                      $scope.$apply();
                    }
                }
            });
          }
        };

        $scope.assignCurrent = function(id) {
            ImagePasteTarget.assignCurrent(id);
        }

        $scope.pgJumpItems = null;
        $scope.pgLinkItems = null;

        // This method will be invoked in the following three scenarios:
        // (a) Add mode is invoked.
        // (b) User selects a reference.
        // (c) From the main page, user invokes edit.
        $scope.currentRefSectionChanged = function(selectedItem,bAddNewLink) {
            if (!$scope.currentRefSection) {
                $scope.currentRefSection = angular.copy($scope.selectedRefSection);
            }
            $scope.saveReady = true;
            $scope.fileActionRollbackMgr = new RollBackFileActionsMgr($http,$scope.errObj.serverError);
            $scope.tabJumpItemsCtx = new TabItemsContext($scope,$scope.currentRefSection,"ITEM_JUMP",$scope.currentRefSection.jumpItems,ItemClipboard,$scope.fileActionRollbackMgr);
            $scope.tabLinkItemsCtx = new TabItemsContext($scope,$scope.currentRefSection,"ITEM_LINK",$scope.currentRefSection.linkItems,ItemClipboard,$scope.fileActionRollbackMgr);
            $scope.pgJumpItems = new Pager($scope.currentRefSection.jumpItems,$scope.appSettings.referenceItemsTabPageNumberOfRows,4);
            $scope.pgLinkItems = new Pager($scope.currentRefSection.linkItems,$scope.appSettings.referenceItemsTabPageNumberOfRows,4);
            $scope.msMgr.init($scope.currentRefSection);

            // NEXT STEP - click-to-edit.
            // Do search angularjs controlling active tab with ng-class

            if (selectedItem !== undefined && selectedItem !== null ) {
                if (selectedItem.itemType === "ITEM_LINK") {
                    $scope.activeTab = 'LINK';
                    $scope.tabLinkItemsCtx.selectItem(selectedItem.rowIndex,selectedItem.item);
                    $scope.assignCurrent('linkItemPasteTargetID');
                } else if (selectedItem.itemType === "ITEM_JUMP") {
                    $scope.activeTab = 'JUMP';
                    $scope.tabJumpItemsCtx.selectItem(selectedItem.rowIndex,selectedItem.item);
                    $scope.assignCurrent('jumpItemPasteTargetID');
                } else {
                    throw "Unexpected item type: " + selectedItem.itemType;
                }
            } else if(bAddNewLink) { // User is appending new link item to list using PLUS.s
                $scope.activeTab = 'LINK';
                $scope.assignCurrent('linkItemPasteTargetID');
            }
        };

        $scope.initialize = function(refSectionKey, selectedItem, bAddNewLink) {
          var selectedRefSection = null;
          for (var i in $scope.refSections) {
              if ($scope.refSections[i].key === refSectionKey) {
                  selectedRefSection = $scope.refSections[i];
              }
          }
          if (selectedRefSection === null) {
              throw "SetupModalController - section not found for selected key."
          }
          $scope.currentRefSection = angular.copy(selectedRefSection);
          $scope.original = angular.copy(selectedRefSection);
          $scope.currentRefSectionChanged(selectedItem,bAddNewLink);
        }

        // Handle launching the Setup Dialog when user invokes edit on a Ref section displayed on the main page.
        if (params.hasOwnProperty("selectedKey")) {
            $scope.initialize(params.selectedKey, params.selectedItem,params.bAddNewLink);
        }

        // $scope.sectionType Can be Horz ::= section will for jumpitems and will placed at the
        // top of the screen. Or can be Vert ::= section will contain Jumpitem linkItems, milestones.
        $scope.sectionType = "Sec type";

        $scope.sectionTypeChanged = function(sectionType) {
            $scope.sectionType = "Sec type";
            if (sectionType !== undefined) {
                $scope.currentRefSection.sectionType = sectionType;
            }
        };

        $scope.sectionOrderChanged = function() {
            // Notify the parent scope that the section number has changed so
            // that it can then update sectionOrder in all the refSections.
            $scope.responseParams.sectionOrderHasChanged = true;
        };

        $scope.checkUnsavedEditsOnItemsAndMilestones = function() {
            var msg = null;
            // Check if there are any unsaved edits in the current jump or
            // current link item dialog.
            var j = $scope.tabJumpItemsCtx.isDirty();
            var l = $scope.tabLinkItemsCtx.isDirty();
            var m = $scope.msMgr.isDirty();

            if (j || l || m) {
                var terms = [];
                if (j) {
                    terms.push("jump item")
                }
                if (l) {
                    terms.push("link item")
                }
                if (m) {
                    terms.push("milestones")
                }
                msg = sentence("There are unsaved changes on the current",terms, "");
            }
            return msg;
        }

        // Main Dialog Buttons - buttons at the bottom of Dialog
        $scope.save = function () {
            var msg = $scope.checkUnsavedEditsOnItemsAndMilestones();
            if (msg != null) {
                msg += "please save or clear changes."
                bootbox.alert({
                    size: 'small',
                    message: msg,
                    callback: function () {
                    }
                });
            } else {
              dereg();
              // Delete image files for any items being deleted.
              $scope.fileActionRollbackMgr.processCommitDeletes();
              ItemClipboard.pasteCommit($scope.currentRefSection);
              saveDelegate($scope,modals,$scope.responseParams);
            }
        };

        $scope.cancel = function() {

           /* Warning message scenarios:
                s1: There are unsaved changes on the current jump item and milesone and there are applied changes elsewhere on the reference section, are you sure you want to cancel?

                s2: There are unsaved changes on the current jump item and milesone are you sure you want to cancel?

                s3: There are applied changes on the reference section, are you sure you want to cancel?
            */

            var msg = null;
            if ($scope.currentRefSection !== undefined) {
                msg = $scope.checkUnsavedEditsOnItemsAndMilestones();

                if (msg != null && $scope.dirtyDataIndicator) {
                    msg += " and there are applied changes elsewhere on the reference section, are you sure you want to cancel?"
                } else if (msg != null) {
                    msg += "are you sure you want to cancel?"
                } else if ($scope.dirtyDataIndicator) {
                    msg = "There are applied changes on the reference section, are you sure you want to cancel?"
                } else {
                    // No errors
                }
            }

            if (msg != null) {
                bootbox.confirm({
                    size: 'small',
                    message: msg,
                    callback: function(confirmed){
                        if (confirmed) {
                            dereg();
                            // Delete any image files created for reference items.
                            ItemClipboard.pasteRollback();
                            $scope.fileActionRollbackMgr.processUndoAddsForRefSection();
                            modals.resolve();
                        }
                    }
                });
            } else {
                dereg(); modals.resolve();
            }
        }

        $scope.delete = function () {
            bootbox.confirm({
                size: 'small',
                message: "Are you sure you want to delete " + $scope.currentRefSection.title,
                callback: function(confirmed){
                    if (confirmed) {
                        dereg();
                        deleteAllAttachedImageFiles($scope,$http);
                        ItemClipboard.pasteRollback();
                        deleteDelegate($scope,modals,$scope.responseParams);
                    }
                }
            });
        };

    }
);

var dirtyDataCheck = function(newValue,oldValue,scope) {
    // Objects :  INDB have a unique _ID parameter, NIDB do not.
    // 						NEW or UPDATED
    var run = function(newValue,oldValue,scope) {
        var rule = "?";
        if (newValue === undefined) {
            scope.dirtyDataIndicator = false;
            rule = "A";
            return rule;
        }

        if (oldValue === undefined && newValue !== undefined) {
            scope.original = angular.copy(newValue);
            scope.dirtyDataIndicator = false;
            rule = "B";
            return rule;
        }

        // oldValue and newValue exist so we must compare.
        if (oldValue.hasOwnProperty("_id") && newValue.hasOwnProperty("_id")) {
            if (oldValue._id !== newValue._id) {
                scope.original = angular.copy(newValue);
                scope.dirtyDataIndicator = false;
                rule = "C";
            } else {
                if (angular.equals(newValue,scope.original)) {
                    scope.dirtyDataIndicator = false;
                    rule = "D";
                } else {
                    scope.dirtyDataIndicator = true; // Same _id but deltas with other variables.
                    rule = "E";
                }
            }
            return rule;
        }

        if (angular.equals(newValue,scope.original)){
            scope.dirtyDataIndicator = false;
            rule = "F";
        } else {
            scope.dirtyDataIndicator = true;
            rule = "G";
        }
        return rule;
    }
    var rule = run(newValue,oldValue,scope);
    // console.log("newValue = " + newValue + " OldValue " + oldValue + " Rule is: " + rule);
};

var noChange = function(a,b) {
    return (JSON.stringify(a) === JSON.stringify(b))
}

var saveDelegate = function(scope,modals,respParams) {

    respParams.updatedRefSection = angular.copy(scope.currentRefSection);
    respParams.action = scope.mode; // "Add" or "Edit"
    modals.resolve(respParams);
};

var deleteDelegate = function(scope,modals,respParams) {
    var o = scope.currentRefSection;
    respParams.action="Delete";
    respParams.deletedRefSection = o;
    modals.resolve(respParams);
};

// Traverse all linkItems for image files and delete.
var deleteAllAttachedImageFiles = function(scope,http) {
    _.each(scope.currentRefSection.linkItems,function(item) {
      if (item.images) {
        _.each(item.images,function(image) {
              http.delete('/local/deleteimage/' + image.fileName).
                then(function(response){
                },
                function(response){
                  scope.serverError = response.data;
                });
        });
      }
    });
};

var generateKeyFromTitle = function(title) {
    return title.toLowerCase().replace(/ (\w)/g, function(x) {
        return x.toUpperCase();
    }).replace(/[' "]/g,"");  // Fix, don't allow ' or " in keys. How To's title caused a problem!
};

var createReferenceInstance = function( RefDA ) {
    var d = new Date();
    var obj = new RefDA;
    obj.dtype = "ref-section";
    obj.createDate = d;
    obj.title = "";
    obj.key = "";
    obj.comment = "";
    obj.sectionOrder = 99;
    obj.sectionSize = -1;
    obj.sectionType = "Vert";
    obj.jumpItems = [];
    obj.linkItems = [];
    return obj;
};
