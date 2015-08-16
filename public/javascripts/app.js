angular.module('app', ['ngRoute','ngResource','ngAnimate']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/', {controller: null, templateUrl: 'index.html'}).
			otherwise({redirectTo:'/'});
	}]);

angular.module('app')
	.controller('HomeCtrl', ['$scope','modals' ,'RefDA', function ($scope,modals,RefDA,$modal) {
		loadData($scope,RefDA);
		$scope.message="No Msg";
		$scope.setup = function(){
			var promise = modals.open(
				"setup",
				{
					refSections: $scope.refSections
				}
			);
			promise.then(
				function handleResolve( response ) {
					if (response === undefined) {
						// then must be a cancel
					} else {
						var changeList = [];
						if (response.hasOwnProperty("sectionOrderHasChanged")) {
							// responseParams.refSection
							// Update the order of the sequences
							console.log("handleResolve: - sectionOrderHasChanged for: " + response);
							var iter = new Iterators($scope.refSections);
							changeList = iter.resetOrderSequence(response.updatedRefSection);
						}

						var found = false;
						for (var f in changeList) {
							if (changeList[f] === response.updatedRefSection ) {
								found = true;
							}
						}
						if (!found) {changeList.push(response.updatedRefSection);}
						for (var e in changeList) {
							changeList[e].$save(function (response) {

								},
								function (response) {
									throw "Failed to save!"
								}
							);
						}

						loadData($scope,RefDA);
						console.log("Confirm resolved.");
					}
				},
				function handleReject( error ) {
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
		// scope.refSections = resultToMap(s);
	});
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

		for (var i in r[d].linkItems) {
			var item = r[d].linkItems[i];
			if (item.note !== undefined && item.note !='') {
				item.titleDisplay = item.title + '*'
			} else {
				item.titleDisplay = item.title;
			}
		}
	}
};

// We get an array back from the database so need to turn into map for easy reading.
var resultToMap = function(r) {
	var result = {};
	for (var e in r) {
		if (r[e].key !== undefined) {
			result[r[e].key] = r[e];
		}
	}
	return result;
};

angular.module('app')
	.factory('RefDA',['$resource', function($resource) {
		// See page 110 of AngularJS book.
		// https://docs.angularjs.org/api/ngResource/service/$resource
		return $resource('/model/qlinks/:refId',
			{refId:'@_id'},
			{ create: {method:'POST', params:{}, isArray:false}});
	}]);

/* ====================================================================================================================

 	SetupModalController

 =====================================================================================================================*/
angular.module('app').controller(
	"SetupModalController",
	function( $scope, modals, RefDA) {
		$scope.mode = "Edit";  // Over all mode for dialog, can be Add or Edit.
		$scope.tabJumpItemsCtx = new TabItemsContext;
		$scope.tabLinkItemsCtx = new TabItemsContext;
		$scope.saveReady = false;
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
		}

		$scope.titleChanged = function() {
			$scope.currentRefSection.key = generateKeyFromTitle($scope.currentRefSection.title);
		}

		$scope.currentRefSectionChanged = function() {
			// When fired we can be sure that a valid reference exists.
			$scope.saveReady = true;
			$scope.tabJumpItemsCtx.reset();
			$scope.tabLinkItemsCtx.reset();
		};


		// $scope.sectionType Can be Horz ::= section will for jumpitems and will placed at the
		// top of the screen. Or can be Vert ::= section will contain Jumpitem linkItems, milestones.
		$scope.sectionType = "Sec type";

		$scope.sectionTypeChanged = function(sectionType) {
			  $scope.sectionType = "Sec type";
				if (sectionType !== undefined) {
					$scope.currentRefSection.sectionType = sectionType;
				}
		};

			$scope.responseParams = {};
		$scope.sectionOrderChanged = function() {
				// Notify the parent scope that the section number has changed so
				// that it can then update sectionOrder in all the refSections.
				$scope.responseParams.sectionOrderHasChanged = true;
		};

		// Main Dialog Buttons - buttons at the bottom of Dialog
		$scope.save = function () {
					saveDelegate($scope,modals,$scope.responseParams);
				};
		$scope.delete = function () {deleteDelegate($scope,modals)};
		$scope.deny = modals.resolve; // Cancel
	}
);

var saveDelegate = function(scope,modals,respParams) {
	if(scope.currentRefSection.hasOwnProperty("titleDisplay")) {
		delete scope.currentRefSection.titleDisplay;
	}
	respParams.updatedRefSection = scope.currentRefSection;
	modals.resolve(respParams);
};

var deleteDelegate = function(scope,modals) {
	var o = scope.currentRefSection;
	o.$delete(function(response){
			modals.resolve();
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
	}

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
	}

	this.itemCancel = function() {
		this.reset();
	}
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
	obj.jumpItems = [];
	obj.linkItems = [];
	return obj;
}

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
