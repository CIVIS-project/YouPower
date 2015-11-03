
angular.module('civis.youpower.actions').controller('FormsCtrl', FormsCtrl);

// Inject my dependencies
// SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $stateParams, $ionicPopup, User, Actions, $translate) {

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

	/*/
		Confirm the points the user got. 
		And if the user's inProgess is less than $scope.preferredNumberOfActions, ask the user whether he wants a new suggestion. 
	/*/
	$scope.showConfirm = function(completed){

		var title = completed ? $translate.instant('Action_Completed') : $translate.instant('Action_Removed');
		var text = "";
		var alertPopup = {} ; 

		var pointsText = "<span ng-if='hasFeedback' translate>THANKS_FEEDBACK</span> <span ng-if='points>0'><span translate>You_got</span> {{points}} <span translate>{{points>1?'points':'point'}}</span>.</span>"; 

		console.log ("Size:" + _.size($scope.currentUser.actions.inProgress)); 

		if (completed && $scope.actions[$scope.currentAction._id].type != 'onetime'){
				//make a reschedule of the same action

			$scope.askScheduleNext(pointsText); 

		}else if (_.size($scope.currentUser.actions.inProgress) <= $scope.preferredNumberOfActions) {

			text = completed ? "<span translate>ASK_ADD_ANOTHER_ACTION</span>" : "<span translate>SORRY_ADD</span>"; 

			alertPopup = $ionicPopup.confirm({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + pointsText + " " + text + "</span>", 
				okText: $translate.instant("Yes"),
				cancelText: $translate.instant("Not now"),
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				$scope.disableBack();
				console.log (res); 
				$scope.points = 0; 
				if(res) {
					$scope.addActions();
				}else {
					$scope.gotoYourActions();
				}
			});
		} else {
			text = completed ? "<span translate>CONGRATS</span>" : "<span translate>SORRY_NOT_SUIT</span>"; 

			alertPopup = $ionicPopup.alert({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + pointsText + " " + text + "</span>", 
				okText: $translate.instant("OK"),
				okType: "button-dark"
			});
			alertPopup.then(function(res) {
				$scope.points = 0; 
				console.log (res); 
				$scope.gotoYourActions();
			}); 
		}
	}

	

	$scope.inputDaysAndSchedule = function(action){

	$scope.input = {}; 

	var alertPopup = $ionicPopup.show({
	  title: "<span class='text-medium-large'>"+ $translate.instant('Schedule_Action') + "</span>",
	  scope: $scope, 
	  template: "<form name='popup' class='text-medium text-center'>" + "<span translate>RETAKE_ACTION</span> <b>{{currentAction.name}}</b> <span translate>Remind_me_in</span> <div><input name='inputDays' type='number' min='1' max='1000' class='text-center' ng-model='input.days' placeholder={{'a_number_of'|translate}}> <span translate>days</span>! </div> <div class='errors' ng-show='!popup.inputDays.$valid' translate>NUMBER_1000</div></form>", 
	  buttons: [
	    { text: $translate.instant('Cancel') },
	    { text: $translate.instant('Save'),
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
	    $scope.askAddAction("<span translate translate-values=\"{number:" + res + "}\">ACTION_SCHEDULED</span>"); 
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

		var title = text ? $translate.instant('Action_Scheduled') : $translate.instant('MORE_ACTION'); 
		var alertPopup = {} ; 

		if (_.size($scope.currentUser.actions.inProgress) < $scope.preferredNumberOfActions) {

			$scope.nr = _.size($scope.currentUser.actions.inProgress);

			alertPopup = $ionicPopup.confirm({
				title: "<span class='text-medium-large'>" + title + "</span>",
				scope: $scope, 
				template: "<span class='text-medium'>" + text + " <span ng-if='nr===0' translate>YOU_NO_ACTION</span>" + " <span ng-if='nr===1' translate>YOU_1_ACTION</span>" + " <span ng-if='nr>1' translate translate-values=\"{number: '{{nr}}'}\">YOU_N_ACTION</span>" + " <span translate>{{nr===0 ? 'ADD_ONE':'ADD_ANOTHER_ONE'}}</span>" + "</span>", 
				okText: $translate.instant("Yes"),
				cancelText: $translate.instant("Not_now"),
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
			title: "<span class='text-medium-large'>" + $translate.instant("Action_Completed")+ "</span>",
			scope: $scope, 
			template: "<span class='text-medium'><span translate>Congratulations</span> <i class='ion-happy-outline'></i> " + pointsText + " <span translate>ASK_SCHEDULE</span>" +"</span>", 
			okText: $translate.instant("Yes"),
			cancelText: $translate.instant("Not_now"),
			okType: "button-dark"
		});
		alertPopup.then(function(res) { 
			$scope.points = 0; 
			if(res) {
				$scope.inputDaysAndSchedule($scope.currentAction); 
			}else{
				$scope.askAddAction(); 
			}
		});
	}

	$scope.askFeedback = function(completed){

		var title = "<span class='text-medium-large'>" + $translate.instant("FEEDBACK_NOT_COMPLETED") + "</span>";
		var temp = completed ? "FEEDBACK_ACTION_COMPLETED" : "FEEDBACK_ACTION_NOT_COMPLETED"; 

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "<span class='text-medium' translate>"+ temp + "</span>",
			okText: $translate.instant("Yes"),
			cancelText: $translate.instant("Let_it_be"),
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


		if ($scope.data.rating != 0 || $scope.feedback.text) {

			$scope.hasFeedback = true; 

			if ($scope.data.rating != 0){

				Actions.rateEffort(
			        {id: $scope.currentAction._id}, {effort: $scope.data.rating}).$promise.then(function(data){

			          //console.log("rating: ");
			          //console.log(data); 
			          
			          $scope.data.rating = 0; 
			      });
			}

			if ($scope.feedback.text){

				//the "feedback" text is an action comment (appear under action details)
				Actions.postComment(
			        {actionId: $scope.currentAction._id}, {comment: $scope.feedback.text}).$promise.then(function(data){

			          //add action comment to local list 
			          $scope.comments.unshift(data);
			          //console.log($scope.feedback.text); 

			          $scope.addCommentPoints(); 
			          $scope.points += $scope.commentPoints; 
			          
			          $scope.feedback = {text: ""}; 
			    });
			}

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

				$scope.feedback = {text: ""}; 

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


