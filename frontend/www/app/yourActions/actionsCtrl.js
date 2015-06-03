
controllers.controller('ActionsCtrl', ActionsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionsCtrl($scope, $timeout, $state, $stateParams, $filter, $ionicSlideBoxDelegate, $firebaseArray) { 

	// var ref = new Firebase("https://youpower.firebaseio.com/actions")

	// $scope.actions = $firebaseArray(ref);
	
	$scope.slideIdx = $stateParams.index ? $stateParams.index : 0; 

	$scope.action; 

	// $scope.setSlideIdx = function(i) {
	// 	$scope.slideIdx = i; 
	// 	$timeout( function() {
	// 		console.log("It's now!!!")
	// 		$ionicSlideBoxDelegate.slide($scope.slideIdx);
	// 	}, 5000 );
	// };

	$scope.next = function() {
		$ionicSlideBoxDelegate.next();
	};

	

	$scope.actionCompleted = function(action, actionDone){
		//$scope.actionCanceled = !$scope.actionDone; 

		if(actionDone){
			$scope.action = action; 
			$state.go("tab.action-completed",{id:action.id});
		}
	}


};

