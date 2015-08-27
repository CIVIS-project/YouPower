
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams, $ionicHistory, $firebaseObject, $ionicPopup, User) {

	$scope.actionId = $stateParams.id;

	$scope.currentAction = $scope.currentUser.actions.inProgress[$stateParams.id];

	$scope._act; 

	//ionic rating 
	$scope.data = { rating : 0,  max: 5 };

	// $scope.$watch('data.rating', function() {
	// 	console.log('New value: '+$scope.data.rating);
	// });

$scope.feedback = {text: ""};

$scope.goForward= function() {
	$ionicHistory.nextViewOptions({
		disableBack: true
	});
	$state.go('tab.actions');
}


$scope.goBack= function() {
	$ionicHistory.goBack();
}

$scope.setPoints = function(points) {
	var userRef = new Firebase(endev.firebaseProvider.path + "users/" + $scope.user.$id);
	$firebaseObject(userRef).$loaded().then(function(object){
		object.points = points;
		object.$save();
	});
}

$scope.completed = function(){

	if ($scope.data.rating != 0 || $scope.feedback.text != ""){
		
		//TODO: add bonus points

		//send feedback
		$scope.feedback.rating = $scope.data.rating; 
		$scope.feedback._id = $scope.currentAction._id;  

		console.log($scope.feedback); 

		User.feedback({},{kind:'actionCompleted', content:$scope.feedback}).$promise.then(function(data){

			console.log(data); 

			// // $scope.currentUser.actions.done[$scope.currentAction._id] = $scope.currentAction;
			// // delete $scope.currentUser.actions.inProgress[$scope.currentAction._id]; 
			// });

	});
	}

		//action completed, change action state
		// User.actionState({actionId: $scope.currentAction._id}, {state:'done'}).$promise.then(function(){

		// 	$scope.currentUser.actions.done[$scope.currentAction._id] = $scope.currentAction;
		// 	delete $scope.currentUser.actions.inProgress[$scope.currentAction._id]; 
		// });


	var alertPopup = $ionicPopup.confirm({
		title: 'Action completed',
		template: 'Do you want to add another action?',
		okText: "Yes",
		cancelText: "Not now",
		okType: "button-balanced"
	});
	alertPopup.then(function(res) {
		if(res) {
			$scope.nextTip();
		}else {
			$state.go("main.actions.yours");
		}
	});

}

$scope.abandoned = function(user){
	var alertPopup = $ionicPopup.confirm({
		title: 'Action removed',
		template: 'Do you want to add another action instead?',
		okText: "Yes",
		cancelText: "Not now",
		okType: "button-balanced"
	});
	alertPopup.then(function(res) {
		if(res) {
			$scope.nextTip(user);
		}else {
			$state.go("tab.actions");
		}
	});
}
};


