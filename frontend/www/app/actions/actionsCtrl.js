
angular.module('civis.youpower.actions').controller('ActionsCtrl', ActionsCtrl);


/* The controller that's shared over all the action states.
-----------------------------------------------------------*/
function ActionsCtrl($scope, $state, $ionicPopup, Actions) {

	$scope.idx = -1;
	$scope.lastActionUsed = true; 

	$scope.preferredNumberOfActions = 3; 

	// get the suggested actions from the backend 
	$scope.loadSuggestedActions = function(){
		
		Actions.query().$promise.then(function(data) {

			$scope.suggestedActions = data; 

			console.log("load suggested tips");
			console.log($scope.suggestedActions);

			if ($scope.suggestedActions.length == 0){

				// there is no new action suggestions
				$scope.askRehearse();

			}else{
				// load action details
				$scope.loadActionDetails($scope.suggestedActions); 
			}
		});

	};

	$scope.loadSuggestedActions(); 

	$scope.getActionPoints = function(action){
		// return (action.effort + action.impact)*10; 
		return action.effort + action.impact; 
	};


	$scope.getFormBonus=function(action){
		var bonus = Math.round($scope.getActionPoints(action)/5);
		return bonus < 1 ? 1 : bonus; 
	};


	$scope.askRehearse = function(){

		var title = $scope.salut();

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "You've gone through all the actions. Would you like to rehearse the actions?",
			okText: "Yes",
			cancelText: "Not now",
			okType: "button-balanced"
		});

		alertPopup.then(function(res) {
			if(res) {
				// TODO: clear the record and rehearse the actions 
			}else{
				// do nothing 
			}
		});
	}


	$scope.askConfirmation = function(){

		var title = $scope.salut();

		var alertPopup = $ionicPopup.confirm({
			title: title,
			scope: $scope, 
			template: "You already have {{numberOfCurrentActions}} actions in progress. Are you sure you'd like to add more?",
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
	}


	$scope.nextTip = function(){

		$scope.numberOfCurrentActions = _.size($scope.currentUser.actions.inProgress); 

		if ($scope.numberOfCurrentActions < $scope.preferredNumberOfActions ){
			$scope.showNextTip();
		}else{
			$scope.askConfirmation(); 
		}		
	}

	$scope.showNextTip = function(){

		if ($scope.lastActionUsed){
			$scope.idx++;
			$scope.lastActionUsed = false; 
		}

		if (_.size($scope.suggestedActions) > $scope.idx){

			$state.go('main.actions.action', {id:$scope.suggestedActions[$scope.idx]._id});

      	}else{
      		$scope.idx = -1;
      		$scope.lastActionUsed = true; 

      		$scope.loadSuggestedActions(); 
      	}
      }
  };

