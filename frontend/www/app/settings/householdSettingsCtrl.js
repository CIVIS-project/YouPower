
angular.module('civis.youpower.settings').controller('HouseholdSettingsCtrl', HouseholdSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdSettingsCtrl($scope, $filter, $translate, $state, $timeout, $ionicScrollDelegate, Household, User, currentHousehold) {

	$scope.input = {err: ''};

	$scope.households[$scope.currentUser.householdId] = currentHousehold; 

	$scope.addAppliance= function() {

		$scope.input.err = ''; 

		if ($scope.input.description === '') return; 

		if ($scope.households[$scope.currentUser.householdId].appliancesList.indexOf($scope.input.description) > -1) {
			$scope.input.err = 'ALREADY_EXISTS'; 
			$ionicScrollDelegate.scrollBottom(); 
		}else{
			Household.addAppliance({id: $scope.currentUser.householdId},{appliance: $scope.input.description}).$promise.then(function(data){
				$scope.households[$scope.currentUser.householdId].appliancesList = data.appliancesList; 
				$scope.input.description = ''; 
				$ionicScrollDelegate.scrollBottom(); 
			});
		}
	}

	$scope.removeAppliance= function(index) {

		$scope.input.description = $scope.households[$scope.currentUser.householdId].appliancesList[index]; 
		// $scope.households[$scope.currentUser.householdId].appliancesList.splice(index, 1);

		Household.removeAppliance({id: $scope.currentUser.householdId},{appliance: $scope.input.description}).$promise.then(function(data){

			$scope.households[$scope.currentUser.householdId].appliancesList = data.appliancesList; 
			$ionicScrollDelegate.scrollBottom(); 
		}, function(err){
			$scope.input.description = ''; 
		});
	}

	$scope.reloadCurrentHousehold = function() {

		if ($scope.currentUser.householdId === null) {
			$scope.$broadcast('scroll.refreshComplete'); 
			return; 
		}

		Household.get({id: $scope.currentUser.householdId}).$promise
		.then(function(data){

			$scope.households[$scope.currentUser.householdId] = data; 
		})
		.finally(function() {
	       // Stop the ion-refresher from spinning
	       $scope.$broadcast('scroll.refreshComplete');
		}); 
	};

};

