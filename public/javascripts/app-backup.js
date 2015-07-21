angular.module('app', ['ngRoute','ngDialog']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller: HomeCtrl, templateUrl: 'index.html'}).
      otherwise({redirectTo:'/'});
  });

function HomeCtrl($scope) {
}


/* <wtmilestones start="01/01/15" tdgrb="22/04/15" asgp="20/04/15" alc="15/05/15" etrb="25/05/15" release="01/11/15"></wtmilestones>  */

angular.module('app')
  .directive('wtmilestones', [function () {
    return {
		replace: true,
		transclude: true,
		restrict: 'E',
		scope: {
		  'start':'@',
		  'tdgrb':'@',
		  'asgp':'@',
		  'alc':'@',
		  'etrb':'@',
		  'release':'@'	
		},
		template: 	'<div>'+
					'<p></p>'+
					'<table class="table table-condensed" style="font-size:11px;">'+
					'<thead>'+ 
					'<tr>'+
						'<th>Start</th>'+
						'<th>TDGRB</th>'+
						'<th>ASGP</th>'+
						'<th>ALC</th>'+
						'<th>ETRB</th>'+
						'<th>Release</th>'+
					'</tr>'+
					'</thead>'+
					'<tbody>'+
					'<tr>'+
						'<td>{{start}}</td>'+
						'<td>{{tdgrb}}</td>'+
						'<td>{{asgp}}</td>'+
						'<td>{{alc}}</td>'+
						'<td>{{etrb}}</td>'+
						'<td>{{release}}</td>'+
					'</tr>'+
					'</tbody>'+	
					'</table>'+
					'</div>',
		link: function postLink(scope, element, attrs) {
		
		}	
	}  
}]);

angular.module('app')
  .directive('notes', ['$timeout','ngDialog', function ($timeout, ngDialog) {
    return {
		replace: true,
		transclude: true,
		restrict: 'E',
		scope: {
		  'title':'@',
		  'link':'@',	
		},
		template: '<a style="display: block;" href="{{link}}" target="_self"  ng-mouseenter="enter()" ng-mouseleave="leave()" ng-click="leave()" ng-transclude> </a>',	
		link: function postLink(scope, element, attrs) {
			corePostLink(scope, element, attrs, $timeout,ngDialog);
		}
				
	}  
}]);




angular.module('app')
  .directive('wtref', ['$timeout','ngDialog', function ($timeout, ngDialog) {
    return {
		replace: true,
		transclude: true,
		restrict: 'E',
		scope: {
		  'title':'@',
		  'link':'@',	
		},
		template: '<a style="display: block;" href="{{link}}" target="_self"  ng-mouseenter="enter()" ng-mouseleave="leave()" ng-click="leave()" ng-transclude> </a>',	
		link: function postLink(scope, element, attrs) {
			corePostLink(scope, element, attrs, $timeout,ngDialog);
		}
				
	}  
}]);

angular.module('app')
.directive('wtjump', ['$timeout','ngDialog', function ($timeout, ngDialog) {
    return {
		replace: true,
		transclude: true,
		restrict: 'E',
		
		scope: {
		  'title':'@',
		  'link':'@'
		},
		template: '<a class="btn btn-primary" href="{{link}}" target="_blank"  ng-mouseenter="enter()" ng-mouseleave="leave()" ng-click="leave()" ng-transclude></a>',			
		link: function postLink(scope, element, attrs) {
			corePostLink(scope, element, attrs, $timeout,ngDialog);
		}
	}
}]);

var corePostLink = function(scope, element, attrs,$timeout, ngDialog) {			
	if (attrs.note !== undefined) {
		// Decorate button or <a> text to indicate a note is available.
		newText = element.text() + "*";		
		element.text(newText);		
	}
	scope.timeout = 0;	
	scope.enter = function() {
		scope.timeout = $timeout(function() {
			if (attrs.note !== undefined && attrs.note !="") {				
				scope.launch();
			}
		}, 900)								
	};
	scope.leave = function() {
		if (scope.timeout) $timeout.cancel(scope.timeout);
	};
	
	scope.launch = function() {
		var b = ""
		if(attrs.link !== undefined) {
			b = '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(1)">'+ element.text() +'</button>';
		} else { 
			b = '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(0)">Close</button>'
		}

		var dialog = ngDialog.open({
			template:					
				'<p>' + attrs.note + '</p>' +
				'<div class="ngdialog-buttons">' + 
				b + 
				'</div>',
			plain: true,
			overlay: true
		});
		dialog.closePromise.then(function (data) {
			if (data.value === 1) {
				window.open(attrs.link,'_self');
			}
			/* console.log('ngDialog closed' + (data.value === 1 ? ' using the button' : '') + ' and notified by promise: ' + data.id); */ 
		});
	
	};
};







