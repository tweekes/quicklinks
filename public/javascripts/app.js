angular.module('app', ['ngRoute','ngResource','ngAnimate']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/', {controller: null, templateUrl: 'index.html'}).
			otherwise({redirectTo:'/'});
	}]);

angular.module('app')
	.controller('HomeCtrl', ['$scope','modals' ,'RefDA', function ($scope,modals,RefDA) {
		loadData($scope,RefDA);
		$scope.edit = function(refSectionKey) {
			var params =  {
				selectedKey:refSectionKey,
				refSections: $scope.refSections
			};
			$scope.launchEditor(params);
		};
		$scope.setup = function() {
			var params =  {refSections: $scope.refSections };
			$scope.launchEditor(params);
		};
		$scope.launchEditor = function(params){

			var promise = modals.open(
				"setup",params
			);
			promise.then(
				function handleResolve( response ) {
					if (response === undefined) {
						// then must be a cancel
					} else {
						var iter = new Iterators($scope.refSections);
						var changeList = null;
						if (response.action === "Delete") {
							changeList = iter.resetOrderSequence("DELETE", response.deletedRefSection);
						} else { // Else Action can be "Add" or "Edit"
							if (response.action === "Add") {
								$scope.refSections.push(response.updatedRefSection);
							}
							changeList = iter.resetOrderSequence("UPDATE", response.updatedRefSection);
						}
						for (var e in changeList) {
							var o = changeList[e];
							o.$save(function (response) {
								},
								function (response) {
									throw "Failed to save!"
								}
							);
						}
						loadData($scope, RefDA);
						console.log("Confirm resolved.");
					}
				},
				function handleReject( /*error */ ) {
					console.warn( "Confirm rejected!" );
				}
			);
		};


	}]);

var loadData = function(scope,RefDA) {
	var select = {select:{ dtype: "ref-section"}};
	RefDA.query(select,function(r){
		formatTitleWhenNoteAvailable(r);
		var i = new Iterators(r);
		scope.refSections = i.sectionsAll();
		scope.refSectionsHorizontals = i.sectionsHorizontal();
		scope.refSectionsVerticals = i.sectionsVertical();
		scope.vrows = rowLayoutsForVerticals(scope.refSectionsVerticals,3);
	});
};

var rowLayoutsForVerticals = function(items,numItemsInRow) {
	var rows = [];
	var len = items.length;
	var numRows = Math.ceil(len / numItemsInRow);
	var itemsIndex = 0;
	for (var i = 0; i < numRows;i++) {
		var row = [];
		for (var j = 0; j < numItemsInRow; j++) {
			if(itemsIndex < len) {
				row.push(items[itemsIndex++]);
			}
		}
		rows.push(row);
	}
	return rows;
};

// Rewrites the title when note is available to include an asterisks.
// Mail Account ... becomes ... Mail Account*
var formatTitleWhenNoteAvailable = function(r) {
	for (var d in r) {
		for (var i in r[d].jumpItems) {
			var item = r[d].jumpItems[i];
			if (item.note !== undefined && item.note !='') {
				item.titleDisplay = item.title + '*'
			} else {
				item.titleDisplay = item.title;
			}
		}

		for (var k in r[d].linkItems) {
			var item = r[d].linkItems[k];
			if (item.note !== undefined && item.note !='') {
				item.titleDisplay = item.title + '*'
			} else {
				item.titleDisplay = item.title;
			}
		}
	}
};


/* ====================================================================================================================

 	SetupModalController

 =====================================================================================================================*/
angular.module('app').controller(
	"SetupModalController",
	function( $scope, modals, RefDA) {
		$scope.mode = "Edit";  // Over all mode for dialog, can be Add or Edit.
		$scope.tabJumpItemsCtx = new TabItemsContext;
		$scope.tabLinkItemsCtx = new TabItemsContext;
		$scope.msMgr = new MilestonesMgr;
		$scope.saveReady = false;
		$scope.dirtyDataIndicator = "(*)";
		// Used to communicate flags etc back to the parent controller.
		$scope.responseParams = {};

		// $scope.sectionType Can be Horz ::= section will for jumpitems and will placed at the
		// top of the screen. Or can be Vert ::= section will contain Jumpitem linkItems, milestones.
		$scope.sectionType = "Vert";

		var params = modals.params();
		// Setup defaults using the modal params.
		$scope.refSections = params.refSections;

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

		$scope.pgJumpItems = null;
		$scope.pgLinkItems = null;

		$scope.currentRefSectionChanged = function() {
			// When fired we can be sure that a valid reference exists.
			$scope.saveReady = true;
			$scope.tabJumpItemsCtx.reset();
			$scope.tabLinkItemsCtx.reset();
			$scope.pgJumpItems = new Pager($scope.currentRefSection.jumpItems,5,4); // 8 rows, 4 pager buttons.
			$scope.pgLinkItems = new Pager($scope.currentRefSection.linkItems,5,4);
			$scope.msMgr.init($scope.currentRefSection);
		};


		// Handle launching the Setup Dialog when user invokes edit on a Ref Scetion displayed on the main page.
		if (params.hasOwnProperty("selectedKey")) {
			var selectedRefSection = null;
			for (var i in $scope.refSections) {
				if ($scope.refSections[i].key === params.selectedKey) {
					selectedRefSection = $scope.refSections[i];
				}
			}
			if (selectedRefSection === null) {
				throw "SetupModalController - section not found for selected key."
			}
			$scope.currentRefSection = selectedRefSection;
			$scope.currentRefSectionChanged();
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

		// Main Dialog Buttons - buttons at the bottom of Dialog
		$scope.save = function () {
					saveDelegate($scope,modals,$scope.responseParams);
		};
		$scope.delete = function () {
			bootbox.confirm({
    			size: 'small',
    			message: "Are you sure you want to delete " + $scope.currentRefSection.title,
    			callback: function(confirmed){
						console.log("Delete result:" + confirmed);
						if (confirmed) {
								deleteDelegate($scope,modals,$scope.responseParams);
						}
					}
			})
		};
		$scope.deny = modals.resolve; // Cancel

		var dereg = $scope.$watch('currentRefSection',dirtyDataCheck,true);

	}
);

var dirtyDataCheck = function(newValue,oldValue,scope){
	var rule = "?";
	if (newValue === undefined) {
		scope.dirtyDataIndicator = "";
		rule = "A";
	} else if (oldValue === undefined && newValue !== undefined) {
		scope.original = newValue;
		scope.dirtyDataIndicator = "";
		rule = "B";
	} else if (_.isEqual(newValue,scope.original)){
		scope.dirtyDataIndicator = "";
		rule = "C";
	} else {
		scope.dirtyDataIndicator = "(*)";
		rule = "D";
	}
	console.log("newValue = " + newValue + " OldValue " + oldValue + " Rule is: " + rule);
};

var saveDelegate = function(scope,modals,respParams) {
	if(scope.currentRefSection.hasOwnProperty("titleDisplay")) {
		delete scope.currentRefSection.titleDisplay;
	}

	respParams.updatedRefSection = scope.currentRefSection;
	respParams.action = scope.mode; // "Add" or "Edit"
	modals.resolve(respParams);
};

var deleteDelegate = function(scope,modals,respParams) {
	var o = scope.currentRefSection;
	respParams.action="Delete";
	respParams.deletedRefSection = o;
	o.$delete(function(response){
			modals.resolve(respParams);
		},
		function(response){
			scope.serverError = response.data.error.message;
		});
};

function TabItemsContext(itemList) {
	this.itemList = itemList;
	this.verb = "Add"; // can be Add or Edit
	this.selectedItem = {};
	this.selectedRow = -1;

	this.reset = function() {
		this.verb = "Add";
		this.selectedItem = {};
		this.selectedRow = -1;
	};

	this.selectItem = function(rowIndex,item) {
		if(this.selectedRow !== rowIndex) {
			this.selectedRow = rowIndex;
			this.selectedItem = JSON.parse(JSON.stringify(item));
			this.verb = "Save";
		} else {
			// User has selected the checkbox that is already selected - therefore deselecting.
			// result: there is no current selection.
			$scope.reset();
		}
	};

	// items can be $scope.currentRefSection.jumpItems or $scope.currentRefSection.linkItems.
	this.itemAddOrSave = function(items) {
		var updateIndex;
		if (this.verb === "Add") {
			updateIndex = items.length;
		} else {
			updateIndex = this.selectedRow;
		}
		items[updateIndex] = this.selectedItem;
		this.reset();
	};

	// items can be $scope.currentRefSection.jumpItems or $scope.currentRefSection.linkItems.
	this.itemDelete = function(items) {
		if (this.selectedRow !== -1) { // Only attempt delete if a row is selected.
			items.splice(this.selectedRow, 1);
			this.reset();
		}
	};

	this.itemCancel = function() {
		this.reset();
	};
}

var generateKeyFromTitle = function(title) {
	return title.toLowerCase().replace(/ (\w)/g, function(x) {
		return x.toUpperCase();
	}).replace(/ /g,"");
};

var createReferenceInstance = function( RefDA ) {
	var d = new Date();
	var obj = new RefDA;
	obj.dtype = "ref-section";
	obj.createDate = d;
	obj.sectionType = "Vert";
	obj.sectionOrder = 999;
	obj.jumpItems = [];
	obj.linkItems = [];
	return obj;
};

angular.module('app').controller(
	"NoteDialogModalController",
	function( $scope, modals ) {
		$scope.params = modals.params();
		$scope.title = $scope.params.title.replace("*","");
		$scope.dismissText = "Cancel";

		if($scope.params.link === "") {
			$scope.dismissText = "Close";
		}

		$scope.go = modals.resolve;
		$scope.dismiss = modals.reject;
	}
);
