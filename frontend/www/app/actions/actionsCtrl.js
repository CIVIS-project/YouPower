
angular.module('civis.youpower.actions').controller('ActionsCtrl', ActionsCtrl);


/* The controller that's shared over all the action states.
----------------------------------------------*/
function ActionsCtrl($scope, Actions, $state) {


	$scope.idx = -1;
	$scope.lastActionUsed = true; 

	Actions.query().$promise.then(function(data) {

		$scope.suggestedActions = data; 
		console.log("load suggested tips");
		console.log($scope.suggestedActions);

	});


	$scope.getActionPoints = function(action){
		// return (action.effort + action.impact)*10; 
		return action.effort + action.impact; 
	}


	$scope.getFormBonus=function(action){
		var bonus = Math.round($scope.getActionPoints(action)/5);
		return bonus < 1 ? 1 : bonus; 
	};

	$scope.nextTip = function(){

		if ($scope.lastActionUsed){
			$scope.idx++;
			$scope.lastActionUsed = false; 
		}

		if (_.size($scope.suggestedActions) > $scope.idx){

      		$state.go('main.actions.action', {id:$scope.suggestedActions[$scope.idx]._id});
      		//$state.go('main.actions.action');
	      
	  }else{
	  	console.log("TODO: need to load more actions");
	  	$scope.idx = -1;
	  	$scope.lastActionUsed = true; 
	  }
	}

};

