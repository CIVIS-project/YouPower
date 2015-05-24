
//angular.module('starter.controllers').controller('SettingsCtrl', function($scope, $filter, $translate) {

angular.module('starter.controllers')

.controller('SettingsCtrl', SettingsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate) {

	$scope.settings = {
		enableFriends: true
	};

	$scope.person = {
		username: "jmayer@youpower.eu",
		pwdUpdatedOn: new Date (2014, 3-1 ,3),
		firstname: "Jone",
		//lastname: "Walson",
		nickname: "Jonny",
		gender: 0, 
		birthday: $filter("date")(new Date (1985, 12-1 ,27), 'yyyy-MM-dd'),
		language: 0,
		isDataComplete: true,
		getPwdDate: function() {
			var diff = Math.abs(new Date().getTime() - this.pwdUpdatedOn.getTime());
			diff = Math.ceil(diff / (1000 * 3600 * 24)); //diff in days
			if (diff < 31*1.7) { 
				return "Updated " + diff + " days ago";
			}else if (diff < 365*1.7){
				return "Updated about " + Math.round(diff/30) + " months ago";
			}else return "Updated about " + Math.round(diff/365) + " years ago"; 
		}, 
		getFullName: function() {
			var name = "";
			if (this.firstname) {name += this.firstname;}
			if (this.lastname) {name += " " + this.lastname;}
			if (this.nickname){
				if (name) {name += " (" + this.nickname + ")";}
				else {name = this.nickname;}
			}
			name = name.trim();
			if (name){
				if  (this.gender === 0){ name += " \u2642"; } //male
				else if (this.gender === 1){ name += " \u2640";} //female
				return name;
			}
		},
	};
	
	$scope.personDataView = []; 

	$scope.languages = ["English", "Italian"]; 

	$scope.$on("$ionicView.loaded", function() {
		$scope.setPersonDataView();
	});

	$scope.setPersonDataView = function() {
		$scope.addPersonDataView("Password", $scope.person.getPwdDate()); 
		$scope.addPersonDataView("Name", $scope.person.getFullName()); 
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

