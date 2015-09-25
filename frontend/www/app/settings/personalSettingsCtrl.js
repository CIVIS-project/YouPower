
angular.module('civis.youpower.settings').controller('PersonalSettingsCtrl', PersonalSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function PersonalSettingsCtrl($scope, $filter, $state, $translate) { 

	$scope.languageChanged = function () {
		$translate.use($scope.currentUser.profile.language);
	};



};

