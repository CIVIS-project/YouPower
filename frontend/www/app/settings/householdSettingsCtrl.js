
angular.module('civis.youpower.settings').controller('HouseholdSettingsCtrl', HouseholdSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdSettingsCtrl($scope, $filter, $translate, $state, $timeout, $ionicScrollDelegate, Household, User) {

	$scope.input = {err: ''};

	$scope.addAppliance= function() {

		$scope.input.err = ''; 

		if ($scope.input.description === '') return; 

		if ($scope.households[$scope.currentUser.householdId].appliancesList.indexOf($scope.input.description) < 0 ) {

			$scope.households[$scope.currentUser.householdId].appliancesList.push($scope.input.description); 
			$scope.input.description = '';

			$scope.setAppliancesListChanged();

		}else{
			$scope.input.err = 'ALREADY_EXISTS'; 
		}

		$ionicScrollDelegate.scrollBottom(); 
	}

	$scope.removeAppliance= function(index) {

		$scope.input.description = $scope.households[$scope.currentUser.householdId].appliancesList[index]; 
		$scope.households[$scope.currentUser.householdId].appliancesList.splice(index, 1);

		$scope.setAppliancesListChanged();

	}

	$scope.reloadCurrentHousehold = function() {

		User.getPendingInvites().$promise.then(function(data){
			$scope.currentUser.pendingHouseholdInvites = data.pendingHouseholdInvites;
			$scope.currentUser.pendingCommunityInvites = data.pendingCommunityInvites;
		});

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

