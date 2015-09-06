
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams, $ionicHistory, $ionicPopup, User, Actions) {

	// the user's completed/abandoned action 
	$scope.currentAction = $scope.currentUser.actions.inProgress[$stateParams.id];

	// used by the ionic.rating module 
	$scope.data = { rating : 0,  max: 5 };

	// $scope.$watch('data.rating', function() {
	// 	console.log('New value: '+$scope.data.rating);
	// });

	// input box of the form 
	$scope.feedback = {text: ""};

	$scope.hasFeedback = false; 

	$scope.gotoYourActions = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("main.actions.yours");
	}


	$scope.goBack= function() {
		$ionicHistory.goBack();
	}

	// $scope.setPoints = function(points) {
	// 	var userRef = new Firebase(endev.firebaseProvider.path + "users/" + $scope.user.$id);
	// 	$firebaseObject(userRef).$loaded().then(function(object){
	// 		object.points = points;
	// 		object.$save();
	// 	});
	// }


	$scope.showConfirm = function(completed){

		var title = completed ? 'Action completed' : 'Action removed';

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "<div>{{hasFeedback? 'Many thanks for your feedback!' : ''}}</div> Would you like to add another action?", 
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-balanced"
		});
		alertPopup.then(function(res) {
			if(res) {
				$scope.nextTip();
			}else {
				$scope.gotoYourActions();
			}
		});
	}

	$scope.askFeedback = function(completed){

		var title = 'Your Feedback Form is Empty';
		var temp = completed ? "the action? </br>We'd love to hear from you." : "what went wrong? </br>We'd love to know how to improve."; 

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "Would you like to give us some feedback on "+ temp,
			okText: "Yes",
			cancelText: "Let it be",
			okType: "button-balanced"
		});
		alertPopup.then(function(res) {
			if(res) {
				//
			}else {
				if (completed){
					$scope.changeActionState('done'); 
					$scope.showConfirm(true);
				}else{
					$scope.changeActionState('canceled');
					$scope.showConfirm(false);
				}
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

		if ($scope.feedback.text){

			$scope.hasFeedback = true; 

			//the "feedback" text is an action comment (appear under action details)
			Actions.postComment(
		        {actionId: $scope.currentAction._id}, {comment: $scope.feedback.text}).$promise.then(function(data){

		          //add action comment to local list 
		          $scope.comments.unshift(data);
		          console.log($scope.feedback.text); 
		    });
		}

		if (!$scope.hasFeedback){
			$scope.askFeedback(true);
		}else{
			$scope.changeActionState('done');
			//show popup 
			$scope.showConfirm(true);
		}

	}

	//change the action state of the user's completed/abandoned action ('done'/'canceled')
	$scope.changeActionState = function(state){

		//change action state
		User.actionState({actionId: $scope.currentAction._id}, {state: state}).$promise.then(function(data){

			// update local list
			$scope.currentUser['actions'] = data;
			// $scope.currentUser.actions.done[$scope.currentAction._id] = $scope.currentAction;
			// delete $scope.currentUser.actions.inProgress[$scope.currentAction._id]; 
		});

	}


	$scope.abandoned = function(){

		if ($scope.feedback.text || _.keys($scope.feedback).length > 1){

			$scope.hasFeedback = true; 

			$scope.feedback._id = $scope.currentAction._id;

			User.feedback({},{kind:'actionCanceled', content: $scope.feedback}).$promise.then(function(data){
				console.log(data);
			});

			$scope.changeActionState('canceled');
			//show popup 
			$scope.showConfirm(false);

		}else{
			$scope.askFeedback(false);
		}
	}
};


