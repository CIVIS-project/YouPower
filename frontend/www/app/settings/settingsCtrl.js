
angular.module('civis.youpower.settings').controller('SettingsCtrl', SettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate, PersonalProfile) {

	$scope.person = PersonalProfile.personalData;

	$scope.person.birthday = $filter("date")($scope.person.birthday, 'yyyy-MM-dd');

	$scope.person.isDataComplete = true;

	$scope.personDataView = [];

	$scope.languages = ["English", "Italian"];

	$scope.$on("$ionicView.loaded", function() {
		$scope.setPersonDataView();
	});

	$scope.setPersonDataView = function() {
		$scope.addPersonDataView("Password", PersonalProfile.getPwdDate());
		$scope.addPersonDataView("Name", PersonalProfile.getFullName());
		$scope.addPersonDataView("Birthday", $scope.person.birthday);
		$scope.addPersonDataView("Language", $scope.languages[$scope.person.language]);
	};


	$scope.addPersonDataView = function(l, v) {
		if (v) {$scope.personDataView.push({label: l, value: v});}
		else {$scope.person.isDataComplete = false;}
	};

	$scope.save = function () {
		if ($scope.currentUser.language == 1){
			$translate.use("it");
		}else $translate.use("en");
	};

	//////////////////////////
	$scope.household = {};
	//////////////////////////
	$scope.pref = {};

};

