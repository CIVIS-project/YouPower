
angular.module('civis.youpower.actions').controller('ActionsCtrl', ActionsCtrl);


/* The controller that's shared over all the action states.
-----------------------------------------------------------*/
function ActionsCtrl($scope, $state, $ionicPopup, Actions, User) {

	//for recommending (current) actions
	$scope.preferredNumberOfActions = 3; 
	$scope.maxNumberOfActions = 10; 

	//for showing at UI since the lists can be quite long
	$scope.maxNumberShow = { inProgress: 2, pending: 2, done:2 };

	//how long a routine action can be deemed completed
	$scope.routineActionDuration = 3; //+weeks

	//get the suggested actions from the backend 
	$scope.loadSuggestedActions = function(){

		$scope.idx = -1;
		$scope.lastActionUsed = true; 
		$scope.suggestedActions = []; 
		
		Actions.query().$promise.then(function(data) {

			$scope.suggestedActions = data; 

			console.log("load suggested tips");
			console.log($scope.suggestedActions);

			$scope.loadActionDetails($scope.suggestedActions); 
		});
	};

	$scope.loadSuggestedActions(); 

	$scope.addDays = function(days){

	    var date = new Date(); 

	    if (days && _.isNumber(days)){
	      date.setDate(date.getDate() + days);
	    }

	    console.log(date);

	    return date; 
	}

	$scope.showMore = function(type){
		$scope.maxNumberShow[type] += 2; 
		if ($scope.maxNumberShow[type] > _.size($scope.currentUser.actions[type]))
			$scope.maxNumberShow[type] = _.size($scope.currentUser.actions[type]);
	}

	$scope.showLess = function(type){
		$scope.maxNumberShow[type]  -= 2;
		if ($scope.maxNumberShow[type] < 0)
			$scope.maxNumberShow[type] = 0;
	}

	$scope.askRehearse = function(){

		var title = $scope.salut();

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			template: "<span class='text-medium'>You've gone through all the actions in our database. Would you like to rehearse the actions?</span>",
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-balanced"
		});

		alertPopup.then(function(res) {
			if(res) {
				// TODO: clear the record and rehearse the actions 
				$scope.gotoYourActions(); 
			}else{
				$scope.gotoYourActions(); 
			}
		});
	};


	$scope.askConfirmation = function(){

		var title = $scope.salut();

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium'>You already have {{numberOfCurrentActions}} actions in progress. Are you sure you'd like to add more?</span>",
			okText: "Not now",
			cancelText: "Add more",
			okType: "button-balanced"
		});

		alertPopup.then(function(res) {
			if(res) {
				// do nothing 
			}else{
				$scope.showNextTip(); 
			}
		});
	};


	$scope.alertTooManyActions = function(){

		var title = $scope.salut();

		var alertPopup = $ionicPopup.alert({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium'>You already have {{numberOfCurrentActions}} actions in progress. You can add more actions after some of those are completed. Keep on. You are doing great!</span>",
			//okText: "Yes",
			okType: "button-balanced"
		});

		alertPopup.then(function(res) {
			$scope.gotoYourActions(); 
		});
	};

	/*	Checks the user's current number of actions first. 
		(1) No new action will be shown if the user already has too many (maxNumberOfActions) actions in progress 
		(2) Shows a new tip when the user does not have enough (preferredNumberOfActions) actions or when the user confirms to add more. 
	*/
	$scope.addActions = function(){

		$scope.numberOfCurrentActions = _.size($scope.currentUser.actions.inProgress); 

		if ($scope.numberOfCurrentActions < $scope.preferredNumberOfActions)
		{
			$scope.showNextTip();
		}else if ($scope.numberOfCurrentActions > $scope.maxNumberOfActions - 1 )
		{
			$scope.alertTooManyActions(); 
		}else{
			$scope.askConfirmation(); 
		}		
	};

	$scope.showNextTip = function(){

		if ($scope.lastActionUsed){
			$scope.idx++;
			$scope.lastActionUsed = false; 
		}

		if (_.size($scope.suggestedActions) > $scope.idx){

			$state.go('main.actions.action', {id:$scope.suggestedActions[$scope.idx]._id});

		}else{
			$scope.askRehearse(); 
		}
	};


	$scope.setSuggestedActionStateWithPreload = function(actionId, actionState, date){

		$scope.lastActionUsed = true; 

		User.actionState({actionId: actionId}, {state: actionState, postponed: date}).$promise.then(function(data){

			console.log(data); 
			$scope.currentUser.actions = data; 

			$scope.numberOfCurrentActions = _.size($scope.currentUser.actions.inProgress); 

  			/*
  				Pre-load new suggested actions if the used action is the last suggested action.
  				This has to be called after the change of action state. 
  			*/
  			if ( ! (_.size($scope.suggestedActions) > $scope.idx + 1) ){
  				$scope.loadSuggestedActions(); 
  			}
  		});

	};

	$scope.postActionState = function(actionId, actionState, date){

		User.actionState({actionId: actionId}, {state: actionState, postponed: date}).$promise.then(function(data){

			console.log(data); 
			$scope.currentUser.actions = data; 

			$scope.numberOfCurrentActions = _.size($scope.currentUser.actions.inProgress); 
  		});
	};

}

