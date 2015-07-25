
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

};

