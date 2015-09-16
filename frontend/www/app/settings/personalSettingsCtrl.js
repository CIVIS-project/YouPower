
angular.module('civis.youpower.settings').controller('PersonalSettingsCtrl', PersonalSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function PersonalSettingsCtrl($scope, $filter, $translate, $state) {

	$scope.save = function () {
		// if ($scope.currentUser.language == 1){
		// 	$translate.use("it");
		// }else $translate.use("en");
	};



};

