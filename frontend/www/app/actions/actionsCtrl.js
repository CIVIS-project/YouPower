
angular.module('civis.youpower.actions').controller('ActionsCtrl', ActionsCtrl);


/* The controller that's shared over all the action states.
 ----------------------------------------------*/
function ActionsCtrl($scope,Actions) {


	console.log("suggested actions");
	console.log(Actions.query());

	// Actions.get().then(function(data) {

	// 	$scope.suggestedActions = data;

	// 	// $scope.userActions = $scope.currentUser.actions;
	// 	// console.log("1");
	// 	console.log($scope.suggestedActions);
	// 	// console.log("2");
	// 	// console.log($scope.userActions);

	// });

};

