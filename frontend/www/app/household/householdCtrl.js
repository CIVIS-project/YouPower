
angular.module('civis.youpower.actions').controller('HouseholdCtrl', HouseholdCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdCtrl($scope, $filter, $translate, $state) {

	

	$scope.addMember = function(){

		console.log("add member");
		$state.go('main.actions.addmember');

	}

	

};

