angular.module('app', ['ngRoute','ngResource','ngAnimate']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/', {controller: null, templateUrl: 'index.html'}).
			otherwise({redirectTo:'/'});
	}]);

angular.module('app').run(function() {
	// console.log("Hello from run!");
});

angular.module('app')
	.controller('HomeCtrl', ['$scope','$window','modals' ,'RefDA','Settings',
		                      function ($scope,$window,modals,RefDA,Settings) {
		$scope.settings = {};
		$scope.bootstrapColumnStyle = "col-lg-3";
		Settings.getSettings(function(s) {
				$scope.settings = s;
				// Determine a compatiple bootstrap with for the cofigured main screen columns setting.
				var boostrapColumnStyles = [null,"col-lg-12","col-lg-6","col-lg-4","col-lg-3",null,"col-lg-2"];
				if ($scope.settings.mainScreenColumns < boostrapColumnStyles.length &&
					boostrapColumnStyles[$scope.settings.mainScreenColumns] !== null) {
					$scope.bootstrapColumnStyle = boostrapColumnStyles[$scope.settings.mainScreenColumns];
				}
				loadData($scope,RefDA);
		});

		//  loadData($scope,RefDA); Original position of the call.
		$scope.renderAppButtons = 1;

		$scope.edit = function(refSectionKey,item) {
			var params =  {
				selectedKey:refSectionKey,
				refSections: $scope.refSections
			};

			// Has the edit being invoked on a link item?
			if (item!==undefined) {
				params.selectedItem = item;
			}
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
		$scope.launchSettings = function() {
			var settingsLaunchParams = {};
			var promiseForSettings = modals.open(
				"settings", settingsLaunchParams
			);
			promiseForSettings.then(
				function handleSettingsResolve() {
					$window.location.reload();
					console.log("handleSettingResolve() - called.");
				},
				function handleSettingsReject() {
					console.log("handleSettingsReject() - called.");
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
		scope.refHorizontalRows = rowLayoutForHorizontals(scope.refSectionsHorizontals);
		scope.refSectionsVerticals = i.sectionsVertical();
		scope.vrows = rowLayoutsForVerticals(scope.refSectionsVerticals,scope.settings.mainScreenColumns);
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

var rowLayoutForHorizontals = function(items) {
	var hRows = [];
	var r = { capacity: 10, hRow: [], gauge:0 };
	for (i in items) {
		var item = items[i];
		if(item.sectionSize === undefined) {
			throw "Error: Size not specified for horizontal section: " + item.title;
		}
		if( ((r.capacity - r.gauge) - item.sectionSize) < 0 ) {
			if (r.gauge === 0) {
				throw "Error: horizontal section size exceeds row capacity when gauge is zero, most likely trying to" +
					  "put size 12 on first row which can only be size 10!"
			}
			hRows.push(r.hRow);
			r = {capacity:12, hRow:[], gauge:0};
		}
		r.gauge+=item.sectionSize;
		r.hRow.push(item);
	}

	if (r.gauge > 0) {
		hRows.push(r.hRow);
	}
	return hRows;
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

/*
TODO: remove later as it is not used.
var isEqualsReferences = function(a,b) {
	return ( angular.equals(a, b) &&
	_.isEqual(a.jumpItems, b.jumpItems) &&
	_.isEqual(a.linkItems, b.linkItems));
};
*/


