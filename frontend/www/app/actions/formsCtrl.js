
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
// SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

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


	/*/
		Confirm the points the user got. 
		And if the user's inProgess is less than $scope.preferredNumberOfActions, ask the user whether he wants a new suggestion. 
	/*/
	$scope.showConfirm = function(completed){

		var title = completed ? 'Action Completed' : 'Action Removed';
		var text = "";
		var alertPopup = {} ; 

		var pointsText = "<span ng-if='hasFeedback'>Many thanks for your feedback! </span><span ng-if='points>0'>You got {{points}} point{{points>1?'s':''}}. </span>" 

		console.log ("Size:" + _.size($scope.currentUser.actions.inProgress)); 

		if (completed && $scope.actions[$scope.currentAction._id].type != 'onetime'){
				//make a reschdule of the same action

			$scope.askScheduleNext(pointsText); 

		}else if (_.size($scope.currentUser.actions.inProgress) <= $scope.preferredNumberOfActions) {

			text = completed ? "Would you like to add another action?" : "We are sorry that this action didn't suit you well. Would you like to try another one?"; 

			alertPopup = $ionicPopup.confirm({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + pointsText + text + "</span>", 
				okText: "Yes",
				cancelText: "Not now",
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				$scope.disableBack();
				console.log (res); 
				if(res) {
					$scope.addActions();
				}else {
					$scope.gotoYourActions();
				}
			});
		} else {
			text = completed ? "Great that you took this action. Congrats!" : "We are sorry that this action didn't suit you well. Please keep on trying others."; 

			alertPopup = $ionicPopup.alert({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + pointsText + text + "</span>", 
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				console.log (res); 
				$scope.gotoYourActions();
			}); 
		}
	}

	$scope.input = {}; 

	$scope.inputDaysAndSchedule = function(action){

	var alertPopup = $ionicPopup.show({
	  title: "<span class='text-medium-large'>Schedule Action</span>",
	  scope: $scope, 
	  template: "<form name='popup' class='text-medium text-center'>I want to retake the action: <b>{{currentAction.name}}</b> Remind me in <div><input name='inputDays' type='number' min='1' max='1000' class='text-center' ng-model='input.days' placeholder='a number of'> days! </div> <div class='errors' ng-show='!popup.inputDays.$valid'>Please give a number between 1 and 1000!</div></form>", 
	  buttons: [
	    { text: 'Cancel' },
	    { text: 'Save',
	      type: 'button-dark',
	      onTap: function(e) {
	        if (!$scope.input.days) { 
	          //don't allow the user to close unless he enters a number
	          e.preventDefault();
	        } else {  return $scope.input.days; }
	      }
	    }
	  ]
	});
	alertPopup.then(function(res) {
	  if(res) {
	    $scope.schduleAction(action, res); 
	    $scope.askAddAction("Congratulations and thanks. The action is scheduled in " + res + " days. "); 
	  }else{
	  	$scope.askAddAction(); 
	  }
	});
	}

	//schedule an action 
	$scope.schduleAction = function(action, pendingDays) {
	  
	  $scope.postActionState(action._id, "pending", $scope.addDays(pendingDays));
	}


	$scope.askAddAction = function(text){

		if (!text){
			text = "";
		}

		var title = text ? 'Action Scheduled' : 'More Action?'; 
		var alertPopup = {} ; 

		if (_.size($scope.currentUser.actions.inProgress) < $scope.preferredNumberOfActions) {

			alertPopup = $ionicPopup.confirm({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + text + "You currently have {{_.size(currentUser.actions.inProgress)==0?'no':_.size(currentUser.actions.inProgress)}} action{{_.size(currentUser.actions.inProgress)>1?'s':''}} in progress. Would you like to add {{_.size(currentUser.actions.inProgress)==0?'':'another '}}one?</span>", 
				okText: "Yes",
				cancelText: "Not now",
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				$scope.disableBack();
				console.log (res); 
				if(res) {
					$scope.addActions();
				}else {
					$scope.gotoYourActions();
				}
			});
		} else if (text){

			alertPopup = $ionicPopup.alert({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + text + "</span>", 
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				console.log (res); 
				$scope.gotoYourActions();
			}); 
		}else{
			$scope.gotoYourActions(); 
		}
	}


	//if the completed action is not of type 'onetime'
	$scope.askScheduleNext = function(pointsText){ 

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>Action completed</span>",
			scope: $scope, 
			template: "<span class='text-medium'>Congratulations <i class='ion-happy-outline'></i> " + pointsText + "Would you like to make a schdule to retake this action in the future?</span>", 
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-dark"
		});
		alertPopup.then(function(res) { 
			if(res) {
				$scope.inputDaysAndSchedule($scope.currentAction); 
			}else{
				$scope.askAddAction(); 
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
			okType: "button-dark"
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


