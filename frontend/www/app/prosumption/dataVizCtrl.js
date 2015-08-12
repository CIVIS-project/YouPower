angular.module('civis.youpower.prosumption').controller('dataVizCtrl', dataVizCtrl);

function dataVizCtrl($scope, $stateParams, $state, User, $http) {
	//just loads the content of the window once the tabs have been generated
$state.go('main.prosumption.yours');
};
