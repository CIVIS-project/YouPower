
controllers.controller('ActionsCtrl', ActionsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionsCtrl($scope, $timeout, $filter, $ionicSlideBoxDelegate, Actions) { 

	$scope.actions = Actions.userActions;
	
	$scope.slideIdx = 0; 

	$scope.scale = 5; 

	$scope.setSlideIdx = function(i) {
		$scope.slideIdx = i;
		$timeout( function() {
			$ionicSlideBoxDelegate.slide($scope.slideIdx);
		}, 50 );
	};

	$scope.next = function() {
		$ionicSlideBoxDelegate.next();
	};

	$scope.getNumber = function(num) {
	    return new Array(num);   
	}


};

