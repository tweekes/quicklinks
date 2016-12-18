
angular.module('app', ['ngResource','ngRoute','ngAnimate']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/', {controller: null, templateUrl: 'index.html'}).
			otherwise({redirectTo:'/'});
	}]);

angular.module('app').run(function() {
	// Do something when the application is loaded into the browser.
});

angular.module('app')
	.controller('HomeCtrl', ['$scope','$window','modals' ,'RefDA','Settings','TemplateUtils',
		                      function ($scope,$window,modals,RefDA,Settings,TemplateUtils) {
		$scope.settings = {};
		$scope.filter = {}; $scope.filter.filterCriteria = "";
		$scope.bootstrapColumnStyle = "col-lg-3";
		Settings.getSettings(function(s) {
				$scope.settings = s;
				// Determine a compatiple bootstrap with for the cofigured main screen columns setting.
				var boostrapColumnStyles = [null,"col-lg-12","col-lg-6","col-lg-4","col-lg-3",null,"col-lg-2"];
				if ($scope.settings.mainScreenColumns < boostrapColumnStyles.length &&
					boostrapColumnStyles[$scope.settings.mainScreenColumns] !== null) {
					$scope.bootstrapColumnStyle = boostrapColumnStyles[$scope.settings.mainScreenColumns];
				}
				loadData($scope,RefDA,applyVerticalSectionsFiltering);
		});

		$scope.titleWithNoteIndicator = TemplateUtils.titleWithNoteIndicator;

		$scope.edit = function(refSectionKey,item,bAddNewLink) {
			var params =  {
				selectedKey:refSectionKey,
				refSections: $scope.refSections
			};

			// Has the edit being invoked on a link item?
			if (item!==undefined) {
				params.selectedItem = item;
			}

			// Pass an indicator parameter when edit() is invoked using the PLUS
			if (bAddNewLink!==undefined && bAddNewLink === true) {
					params.bAddNewLink = bAddNewLink; // Later this will cause editor dialog to select the link tab.
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
									o = response;
								},
								function (response) {
									throw "Failed to save!"
								}
							);
						}

						loadData($scope,RefDA,applyVerticalSectionsFiltering);
					}
				},
				function handleReject( /*error */ ) {

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

				},
				function handleSearchReject() {

				}
			);
		};

		$scope.launchSettings = function() {
			var params = {};
			var promiseForSettings = modals.open(
				"settings", params
			);
			promiseForSettings.then(
				function handleSettingsResolve() {
					$window.location.reload();

				},
				function handleSettingsReject() {

				}
			);
		};

	   $scope.launchTodoDashboard = function() {
			var params = {
				refSections: $scope.refSections
			};

			var promise = modals.open(
				"tododashboard", params
			);
			promise.then(
				function handleSettingsResolve(response) {
					// $scope.refSections = response.refSections;
				},
				function handleSettingsReject() {

				}
			);
		};

		// logic for handling section filtering.
		$scope.filterSections = function (event) {
			if (event.charCode == 13) { // 13 == CR or Enter

					// Do some escaping of regexp syntax characters.
					var escapers = [
													[/\(/g,'\\('],
													[/\)/g,'\\)'],
													[/\[/g,'\\['],
													[/\]/g,'\\]'],
													[/\*/g,'\\*']
												];

					_.each(escapers, function(escaper){
							// filterCriteria = filterCriteria.replace(/\(/g, '\\(');
							$scope.filter.filterCriteria = $scope.filter.filterCriteria.replace(escaper[0],escaper[1]);
					});
				  applyVerticalSectionsFiltering($scope);
			}
		};

		$scope.sectionTitleFilterCriteriaChanged = function() {
				if ($scope.filter.filterCriteria.trim() === "") {
					applyVerticalSectionsFiltering($scope);
				}
		}

		// The Dragged gets droped on the droppable
		$scope.reordervrefsections = function(keyDropped, keyDragged) {
				var source = _.findWhere($scope.refSectionsVerticals,{key:keyDragged});
				var target = _.findWhere($scope.refSectionsVerticals,{key:keyDropped});

				if (target.key !== source.key) { // Prevent dragging onto self
					if (target.sectionOrder === source.sectionOrder) {
						bootbox.alert({
								size: 'small',
								message: 'The source and target sections have the same section order number ' +
								          'Fix the problem by changing section order using the edit screen.',
								callback: function () {
								}
						});
					} else {
					var tmp = target.sectionOrder;
					target.sectionOrder = source.sectionOrder;
					source.sectionOrder = tmp;
					target.$save();
					source.$save(function (response) {
							 loadData($scope,RefDA,applyVerticalSectionsFiltering);
						}
					);
				}
			}
		}

	}]);


	applyVerticalSectionsFiltering = function (scope) {
		var terms = scope.filter.filterCriteria.split(/\s(?=(?:[^"]|"[^"]*")*$)/); // tokenises quoted strings
		var showVerticalSections = scope.refSectionsVerticals;
		if (terms !== "") {
			var reTerms = [];
			var results = [];
			// Remove the quotes where terms contain more than one word, e.g. "Hello World" becomes Hello World
			_.each(terms, function(term){
					reTerms.push(new RegExp(term.replace(/"/g, ''), 'i'));
			});

			_.each(scope.refSectionsVerticals, function(section) {
					_.each(reTerms,function(re){
							if (section.hasOwnProperty("title") && section.title.search(re) != -1) {
									results.push(section);
							}
					});
			});
			showVerticalSections = results;
		}
		scope.vrows = rowLayoutsForVerticals(showVerticalSections,scope.settings.mainScreenColumns);
	}


var loadData = function(scope,RefDA,applyVerticalSectionsFiltering) {
	var showArchivedRefSections = scope.settings.showArchivedRefSections;
	var select = {select:{ dtype: "ref-section"}};
	RefDA.query(select,function(r){
		var i = new Iterators(r,showArchivedRefSections);
		scope.refSections = i.sectionsAll();
		scope.refSectionsHorizontals = i.sectionsHorizontal();
		scope.refHorizontalRows = rowLayoutForHorizontals(scope.refSectionsHorizontals);
		scope.refSectionsVerticals = i.sectionsVertical();
		scope.vrows = rowLayoutsForVerticals(scope.refSectionsVerticals,scope.settings.mainScreenColumns);

		if (applyVerticalSectionsFiltering) {
			applyVerticalSectionsFiltering(scope);
		}
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
