
controllers.controller('FormsCtrl', FormsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams) { 

	$scope.actionId = $stateParams.id;

};

