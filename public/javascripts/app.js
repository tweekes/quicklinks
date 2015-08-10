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
					loadData($scope,RefDA);
					console.log( "Confirm resolved." );
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
		scope.refSections = resultToMap(r);
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

		// Main Dialog Buttons - buttons at the bottom of Diaglog
		$scope.save = function () {saveDelegate($scope,modals)};
		$scope.delete = function () {deleteDelegate($scope,modals)};
		$scope.deny = modals.resolve; // Cancel
	}
);

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

var saveDelegate = function(scope,modals) {
	var o = scope.currentRefSection;
	if(o.titleDisplay !== undefined) {
		delete o.titleDisplay;
	}
	o.$save(function(response){
		// closes the dialog.
		modals.resolve();
	},
	function(response){
		scope.serverError = response.data.error.message;
	});
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








