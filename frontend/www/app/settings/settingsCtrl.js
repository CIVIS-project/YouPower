
angular.module('civis.youpower.settings').controller('SettingsCtrl', SettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate, $state, User, Household) {

	/*/
		$ionicView.beforeLeave does not work with the tabs
		$stateChangeStart also does not work well if it is put in the tab's controller
	/*/
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

		console.log('state change');

		if (fromState.name === 'main.settings.index' || 
			fromState.name === 'main.settings.personal') {

			if ($scope.isToSignout()){
				$scope.clearToSignout(); 
				$scope.postPersonalProfile($scope.logout); 
			}else{
				$scope.postPersonalProfile(); 
			}

		} else if (fromState.name === 'main.settings.household') {

			if ($scope.isToSignout()){
				$scope.clearToSignout(); 
				$scope.postHouseholdProfile($scope.logout); 
			}else{
				$scope.postHouseholdProfile(); 
			}

		} else {
			console.log("Do nothing: from state -- "+fromState.name); 
		}
	 });


	$scope.postPersonalProfile = function(cb){

		if ($scope.isPersonalProfileChanged()) {

			var profile = $scope.currentUser.profile; 

			if (profile.name === "") profile.name = null; 

			for(var key in profile) {
		        if(profile.hasOwnProperty(key) && profile[key] === null) {
		            delete profile[key]; 
		        }
		    }

			User.profile({}, profile).$promise.then(function(data) {

				$scope.currentUser.profile = data; 

				console.log(data);

				if (data.dob && data.dob !== null){
					$scope.currentUser.profile.dob = new Date(data.dob);
				}
				$scope.clearPersonalProfileChanged(); 
				if (typeof cb === 'function') cb();
			}, function(err){
				console.log(err);
				if (typeof cb === 'function') cb(); 
			});
		}
	}

	$scope.postHouseholdProfile = function(cb){

		if (!$scope.isHouseholdProfileChanged()) return; 

		var data = {};

		if ($scope.isHouseInfoChanged()) {
			data.address = $scope.households[$scope.currentUser.householdId].address;
			data.houseType = $scope.households[$scope.currentUser.householdId].houseType;
			data.size = $scope.households[$scope.currentUser.householdId].size;
			data.ownership = $scope.households[$scope.currentUser.householdId].ownership;
		}

		if ($scope.isHouseholdCompositionChanged()) {
			data.composition = $scope.households[$scope.currentUser.householdId].composition;
		}

		if ($scope.isAppliancesListChanged()) {
			data.appliancesList = $scope.households[$scope.currentUser.householdId].appliancesList;
		}

		// 	for(var key in profile) {
		//         if(profile.hasOwnProperty(key) && profile[key] === null) {
		//             delete profile[key]; 
		//         }
		//     }

			Household.update({id: $scope.currentUser.householdId}, data).$promise.then(function(data) {

				$scope.households[$scope.currentUser.householdId] = data; 

				console.log(data);

				// if (data.dob && data.dob !== null){
				// 	$scope.currentUser.profile.dob = new Date(data.dob);
				// }
				$scope.clearHouseholdProfileChanged(); 
				if (typeof cb === 'function') cb();
			}, function(err){
				console.log(err);
				if (typeof cb === 'function') cb(); 
			});
	}
	

};

