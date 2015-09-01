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
							// Need to remove delete target from the list first db delete.
							changeList = iter.resetOrderSequence("DELETE", response.deletedRefSection);
							response.deletedRefSection.$delete(function(response){
											// Do nothing!
									},
									function(response){
											throw "Failed to Delete!"
									}
							);
						} else { // Else Action can be "Add" or "Edit"
							if (response.action === "Add") {
								$scope.refSections.push(response.updatedRefSection);
							} else {
								updateEntry($scope,response.updatedRefSection);
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

		$scope.launchSearch = function() {
			var searchLaunchParams = {};
			var promiseForSearch = modals.open(
				"search", searchLaunchParams
			);
			promiseForSearch.then(
				function handleSearchResolve() {
					console.log("handleSearchResolve() - called.");
				},
				function handleSearchReject() {
					console.log("handleSearchReject() - called.");
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
		scope.vrows = rowLayoutsForVerticals(scope.refSectionsVerticals,4);
	});
};

var updateEntry = function(scope,o) {
	var found = false;

	for (var i = 0; i < scope.refSections.length; i++) {
		if (scope.refSections[i]._id === o._id) {
			found = true;
			scope.refSections[i] = o;
			break;
		}
	}

	if (!found) {
		throw "ERROR: Update failed!"
	}
}

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
		$scope.tabJumpItemsCtx = null; $scope.tabLinkItemsCtx = null;
		$scope.msMgr = new MilestonesMgr;
		$scope.saveReady = false;
		$scope.dirtyDataIndicator = false;
		$scope.selectedRefSection = null;
		$scope.currentRefSection = undefined;
		var dereg = $scope.$watch('currentRefSection',dirtyDataCheck,true);
		// Used to communicate flags etc back to the parent controller.
		$scope.responseParams = {};

		// $scope.sectionType Can be Horz ::= section will for jumpitems and will placed at the
		// top of the screen. Or can be Vert ::= section will contain Jumpitem linkItems, milestones.
		$scope.sectionType = "Vert";

		// Setup defaults using the modal params.
		var params = modals.params();
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

		// This method will be invoked in the following three scenarios:
		// (a) Add mode is invoked.
		// (b) User selects a reference.
		// (c) From the main page, user invokes edit.
		$scope.currentRefSectionChanged = function() {
			if (!$scope.currentRefSection) {
				$scope.currentRefSection = angular.copy($scope.selectedRefSection);
			}
			$scope.saveReady = true;
			$scope.tabJumpItemsCtx = new TabItemsContext($scope.currentRefSection.jumpItems);
			$scope.tabLinkItemsCtx = new TabItemsContext($scope.currentRefSection.linkItems);
			$scope.pgJumpItems = new Pager($scope.currentRefSection.jumpItems,5,4); // 5 rows, 4 pager buttons.
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
			$scope.currentRefSection = angular.copy(selectedRefSection);
			$scope.original = angular.copy(selectedRefSection);
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
				dereg();
				saveDelegate($scope,modals,$scope.responseParams);
		};
		$scope.delete = function () {
			bootbox.confirm({
    			size: 'small',
    			message: "Are you sure you want to delete " + $scope.currentRefSection.title,
    			callback: function(confirmed){
						if (confirmed) {
								dereg();
								deleteDelegate($scope,modals,$scope.responseParams);
						}
					}
			});
		};

		$scope.cancel = function() {
			if ($scope.dirtyDataIndicator) {
				bootbox.confirm({
						size: 'small',
						message: "Changes have been made are you sure you want to cancel?",
						callback: function(confirmed){
							if (confirmed) {
									dereg();
									modals.resolve()
							}
						}
				});
			} else {
				dereg(); modals.resolve();
			}
		}
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
	if(scope.currentRefSection.hasOwnProperty("titleDisplay")) {
		delete scope.currentRefSection.titleDisplay;
	}

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
	obj.title = "";
	obj.key = "";
	obj.comment = "";
	obj.sectionOrder = "99";
	obj.sectionType = "Vert";
	obj.sectionOrder = 999;
	obj.jumpItems = [];
	obj.linkItems = [];
	return obj;
};

var isEqualsReferences = function(a,b) {
	return ( angular.equals(a, b) &&
	_.isEqual(a.jumpItems, b.jumpItems) &&
	_.isEqual(a.linkItems, b.linkItems));
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
