
angular.module('civis.youpower.settings').controller('SettingsCtrl', SettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function SettingsCtrl($scope, $filter, $translate, $state, User, AuthService) {

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

			console.log(fromState.name); 

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
	

};

