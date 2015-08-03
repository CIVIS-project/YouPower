
angular.module('civis.youpower.actions').controller('ActionsCtrl', ActionsCtrl);


/* The controller that's shared over all the action states.
----------------------------------------------*/
function ActionsCtrl($scope,Actions) {


	$scope.idx = -1;

	Actions.query().$promise.then(function(data) {

		$scope.suggestedActions = data; 
		console.log("load tips");
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

};

