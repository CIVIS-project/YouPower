
angular.module('civis.youpower.settings').controller('SettingsCtrl', SettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate, $state, User, AuthService) {

	$scope.toSignout = false; 

	$scope.profileChanged = {personal: false, household: false};

	$scope.setPersonalProfileChanged = function(){
		$scope.profileChanged.personal = true; 
	}

	$scope.clearPersonalProfileChanged = function(){
		$scope.profileChanged.personal = false; 
	}

	$scope.setHouseholdProfileChanged = function(){
		$scope.profileChanged.household = true; 
	}

	$scope.clearHouseholdProfileChanged = function(){
		$scope.profileChanged.household = false; 
	}

	$scope.isPersonalProfileChanged = function(){
		return $scope.profileChanged.personal; 
	}

	$scope.isHouseholdProfileChanged = function(){
		return $scope.profileChanged.household; 
	}

	/*/
		$ionicView.beforeLeave does not work with the tabs
		$stateChangeStart also does not work well if it is put in the tab's controller
	/*/
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

		//console.log('state change');

		if (fromState.name === 'main.settings.index' || 
			fromState.name === 'main.settings.personal') {

			if ($scope.toSignout){
				$scope.toSignout = false; 
				$scope.postPersonalProfile($scope.logout); 
			}else{
				$scope.postPersonalProfile(); 
			}

		} else if (fromState.name === 'main.settings.household') {

			console.log(fromState.name); 

		} else {
			console.log("Do nothing: from state -- "+fromState.name); 
		}
	 });


	$scope.postPersonalProfile = function(cb){

		if ($scope.isPersonalProfileChanged()) {

			//console.log('update profile');

			User.profile({},$scope.currentUser.profile).$promise.then(function(data){

				$scope.currentUser.profile = data; 
				$scope.currentUser.profile.dob = new Date(data.dob);
				$scope.clearPersonalProfileChanged(); 
				if (typeof cb === 'function') cb();
			});
		}
	}

	// $scope.$on('$ionicView.beforeLeave', function(){
	//     console.log("After Leaving");
	//   });

	$scope.signout = function() {

		if ($scope.isPersonalProfileChanged()){
			$scope.toSignout = true; 
			$state.go('welcome'); 
		}else{
			$scope.logout();
		}
	}
	
	
	$scope.logout = function(){

		console.log('logout'); 
		AuthService.logout();
		$state.go('welcome'); 
	}
	

};

