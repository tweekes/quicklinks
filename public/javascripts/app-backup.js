angular.module('app', ['ngRoute','ngDialog','ngResource','ngAnimate']).
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
		$scope.tabListItemsCtx = new TabItemsContext;

		var params = modals.params();
		// Setup defaults using the modal params.
		$scope.refSections = params.refSections;
		$scope.currentRefSection = createReferenceInstance(RefDA);

		$scope.modeChanged = function(m) {
			if(m === 'Add' && $scope.mode !== "Add") {
				$scope.currentRefSection = createReferenceInstance(RefDA);
				$scope.reInitOnRefSectionChange();
			}
			$scope.mode = m;
		}

		$scope.titleChanged = function() {
			$scope.currentRefSection.key = generateKeyFromTitle($scope.currentRefSection.title);
		}

		$scope.currentRefSectionChanged = function() {
			$scope.reInitOnRefSectionChange();
		}

		$scope.initCurrentJumpAndLinkItem = function() {
			$scope.selectedJumpItem = {};
			$scope.selectedJumpItemRow = -1;
			$scope.modeJumpItems = "Add";

		}

		$scope.initCurrentJumpAndLinkItem();

		// Elements in the Tabs (JunmpList and Link List) need to re-initialized when the user changes the current
		// reference section item.
		$scope.reInitOnRefSectionChange = function() {
			$scope.initCurrentJumpAndLinkItem();
		}

		// Captures the index of the current item selected using the checkboxes.
		// also, ensures only one row / checkbox is active.
		$scope.selectItem = function (index, item) {
			if($scope.selectedJumpItemRow !== index) {
				$scope.selectedJumpItemRow = index;
				$scope.selectedJumpItem = JSON.parse(JSON.stringify(item));
				$scope.modeJumpItems = "Save";
			} else {
				// User has selected the checkbox that is already selected - therefore deselecting.
				// result: there is no current selection.
				$scope.initCurrentJumpAndLinkItem();
			}
		};

		$scope.itemAddOrSave = function() {
			var updateIndex;
			if ($scope.modeJumpItems === "Add") {
				updateIndex = $scope.currentRefSection.jumpItems.length;
			} else {
				updateIndex = $scope.selectedJumpItemRow;
			}
			$scope.currentRefSection.jumpItems[updateIndex] = $scope.selectedJumpItem;
			$scope.initCurrentJumpAndLinkItem();
		};

		$scope.itemDelete = function() {
			$scope.currentRefSection.jumpItems.splice($scope.selectedJumpItemRow,1)
			$scope.initCurrentJumpAndLinkItem();
		}

		$scope.itemCancel = function() {
			$scope.initCurrentJumpAndLinkItem();
		}

		// Main Dialog Buttons - buttons at the bottom of Diaglog
		$scope.save = function () {saveDelegate($scope,modals)};
		$scope.delete = function () {deleteDelegate($scope,modals)};
		$scope.deny = modals.resolve; // Cancel
	}
);

function TabItemsContext() {
	this.verb = "Add"; // can be Add or Edit
	this.selectedItem = {};
	this.selectedRow = -1;
	this.reset = function() {
		this.verb = "Add";
		this.selectedItem = {};
		this.currentRow = -1;
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
	/*
	 {"dtype":"ref-section","key":"consoles","title":"Developer Consoles","comment":"Menu for development consoles like, weblogic, websphere, etc",
	 "jumpItems":[
	 {"title":"Weblogic (Dev)","link":"http://new-dev-centraladmin.us.sunlife:1700/console","note":"FINEOS apps, CDA, etc,"},
	 {"title":"Websphere(Dev)","link":"https://dev-xpressionadmin.us.sunlife:11001/ibm/console/login.do?action=secure","note":""},
	 {"title":"Websphere(Qar)","link":"https://qar-xpressionadmin.us.sunlife:11001/ibm/console/login.do?action=secure","note":""}],
	 "linkItems":[],"_id":"jhMreVZytC8nf5ea"}
	 */
	var d = new Date();
	var obj = new RefDA;
	obj.dtype = "ref-section";
	obj.createDate = d;
	obj.jumpItems = [];
	obj.linkItems = [];
	return obj;
}





