
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $stateParams, $ionicPopup, User, Actions) {

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

	$scope.points = 0; 

	
	// $scope.setPoints = function(points) {
	// 	var userRef = new Firebase(endev.firebaseProvider.path + "users/" + $scope.user.$id);
	// 	$firebaseObject(userRef).$loaded().then(function(object){
	// 		object.points = points;
	// 		object.$save();
	// 	});
	// }


	$scope.showConfirm = function(completed){

		var title = completed ? 'Action completed' : 'Action removed';

		var text = completed ? "Would you like to add another action?" : "We are sorry that action didn't suit you well. Would you like to try another one?";

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>",
			scope: $scope, 
			template: "<span class='text-medium'><span ng-if='hasFeedback'>Many thanks for your feedback! </span><span ng-if='points>0'>You got {{points}} point{{points>1?'s':''}}. </span>" + text + "</span>", 
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-balanced"
		});
		alertPopup.then(function(res) {
			$scope.disableBack();
			if(res) {
				$scope.addActions();
			}else {
				$scope.gotoYourActions();
			}
		});
	}

	$scope.askFeedback = function(completed){

		var title = "<span class='text-medium-large'>Your Feedback Form is not Completed</span>";
		var temp = completed ? "the action? </br>We'd love to hear from you." : "what went wrong? </br>We'd love to know how to improve."; 

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "<span class='text-medium'>Would you like to give us some feedback on "+ temp + "</span>",
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

		          $scope.addCommentPoints(); 
		          $scope.points += $scope.commentPoints; 
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

	$scope.deleteByVal = function(obj, val) {

	    for (var key in obj) {
	        if (obj[key] == val) delete obj[key];
	    }
	}

	$scope.abandoned = function(){

		$scope.deleteByVal($scope.feedback, false);

		if (_.keys($scope.feedback).length > 0){

			$scope.hasFeedback = true; 

			$scope.feedback._id = $scope.currentAction._id;

			User.feedback({},{kind:'actionCanceled', content: $scope.feedback}).$promise.then(function(data){
				console.log(data);
				$scope.addFeedbackPoints();
				$scope.points += $scope.feedbackPoints; 
			});

			$scope.changeActionState('canceled');
			//show popup 
			$scope.showConfirm(false);

		}else{
			$scope.askFeedback(false);
		}
	}

	//change the action state of the user's completed/abandoned action ('done'/'canceled')
	$scope.changeActionState = function(actionState){

		if (actionState == "done"){
			$scope.addActionPoints($scope.currentAction);
			$scope.points += $scope.getActionPoints($scope.currentAction);
		}

		$scope.postActionState($scope.currentAction._id, actionState); 
	}

};


