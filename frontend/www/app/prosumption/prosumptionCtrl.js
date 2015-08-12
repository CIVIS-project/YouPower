angular.module('civis.youpower.prosumption').controller('prosumptionCtrl', prosumptionCtrl);

function prosumptionCtrl($scope, $stateParams, $state, User) {
	//just loads the content of the window once the tabs have been generated
$state.go('main.prosumption.yours');
};
