
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams, $ionicHistory, $ionicPopup, User, Actions) {

	$scope.currentAction = $scope.currentUser.actions.inProgress[$stateParams.id];

	//for the ionic.rating module 
	$scope.data = { rating : 0,  max: 5 };

	// $scope.$watch('data.rating', function() {
	// 	console.log('New value: '+$scope.data.rating);
	// });

	//input box
	$scope.feedback = {text: ""};


	$scope.hasFeedback = false; 

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


	$scope.showConfirm = function(completed){

		var title = completed ? 'Action completed' : 'Action removed';

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "<div>{{hasFeedback? 'Many thanks for your feedback!' : 'Congratulations!'}}</div> Do you want to add another action?",
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-balanced"
		});
		alertPopup.then(function(res) {  //TODO
			if(res) {
				$scope.nextTip();
			}else {
				$state.go("main.actions.yours");
			}
		});
	}

	$scope.askFeedback = function(){

		var title = 'Feedback Form Empty';

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: '<div>Your feedback form is empty.</div> Would you like to give us some feedback?',
			okText: "Yes",
			cancelText: "Let it be",
			okType: "button-balanced"
		});
		alertPopup.then(function(res) {
			if(res) {
				//
			}else {
				$scope.changeActionStateDone(); 
			}
		});
	}

	$scope.completed = function(){

		//user rated the effort level of the actiion
		if ($scope.data.rating != 0){

			$scope.hasFeedback = true; 

			Actions.rateEffort(
		        {id: $scope.currentAction._id}, {effort: $scope.data.rating}).$promise.then(function(data){

		          console.log("rating: ");
		          console.log(data); 
		      });
		}

		if ($scope.feedback.text != ""){

			$scope.hasFeedback = true; 

			//the "feedback" text is an action comment (appear under action details)
			Actions.postComment(
		        {actionId: $scope.currentAction._id},{comment: $scope.feedback.text}).$promise.then(function(data){

		          //add action comment to local list 
		          $scope.comments.unshift(data);
		          console.log($scope.feedback.text); 
		    });
		}

		if (!$scope.hasFeedback){
			$scope.askFeedback();
		}else{
			$scope.changeActionStateDone();
		}

	}

	$scope.changeActionStateDone = function(state){

		//change action state
		User.actionState({actionId: $scope.currentAction._id}, {state: 'done'}).$promise.then(function(data){

			//update local list
			$scope.currentUser.actions.done[$scope.currentAction._id] = $scope.currentAction;
			delete $scope.currentUser.actions.inProgress[$scope.currentAction._id]; 

			//show popup 
			$scope.showConfirm(true);
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


