
//angular.module('starter.controllers').controller('SettingsCtrl', function($scope, $filter, $translate) {

controllers.controller('SettingsCtrl', SettingsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate, personalProfile) {

	$scope.person = personalProfile.personalData;

	$scope.person.birthday = $filter("date")($scope.person.birthday, 'yyyy-MM-dd');

	$scope.person.isDataComplete = true; 
	
	$scope.personDataView = []; 

	$scope.languages = ["English", "Italian"]; 

	$scope.$on("$ionicView.loaded", function() {
		$scope.setPersonDataView();
	});

	$scope.setPersonDataView = function() {
		$scope.addPersonDataView("Password", personalProfile.getPwdDate()); 
		$scope.addPersonDataView("Name", personalProfile.getFullName()); 
		$scope.addPersonDataView("Birthday", $scope.person.birthday); 
		$scope.addPersonDataView("Language", $scope.languages[$scope.person.language]); 
	};


	$scope.addPersonDataView = function(l, v) {
		if (v) {$scope.personDataView.push({label: l, value: v});}
		else {$scope.person.isDataComplete = false;}
	};

	$scope.save = function () {
		if ($scope.person.language == 1){
			$translate.use("it");
		}else $translate.use("en");
	};

	//////////////////////////
	$scope.household = {};
	//////////////////////////
	$scope.pref = {};

};

