
angular.module('civis.youpower.settings').controller('PersonalSettingsCtrl', PersonalSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function PersonalSettingsCtrl($scope, $filter, $state, $translate, $window, $stateParams, Config) { 

	$scope.msg = { fb: "FACEBOOK_ID_INFO" }; 

	if ($stateParams && $stateParams.res !== '') {

	    // console.log("welcome params: " + JSON.stringify($stateParams, null, 4));

	    if ($stateParams.res === 'fbUnauthorized'){
	      $scope.msg.fb = 'Unauthorized_Facebook_Login'; 
	    }else if ($stateParams.token === 'fb'){
	      //reload user profile
	      console.log("reload user profile");
	    }else{
	      // do nothing
	    }
	}

	$scope.languageChanged = function () {
		$translate.use($scope.currentUser.profile.language);
	};

	$scope.linkFB = function(){
      $window.location.href = Config.host + "/api/auth/facebookc/" + $scope.currentUser._id ; 
  	}



};

