angular.module('civis.youpower.main',[])
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });
                event.preventDefault();
            }
        });
    };
})
.controller('AppCtrl', AppCtrl);

/* The controller that should always be on top of routing
hierarchy as it will be loaded with abstract main state.
Here we can do the general app stuff like getting the user's
details (since this is after the user logs in).
----------------------------------------------*/
function AppCtrl($scope, $state, $ionicHistory, $timeout, $ionicViewSwitcher, $ionicLoading, User, Actions, Household, AuthService, $translate, currentUser) {

	$scope.userPictures = {}; 

	$scope.actions = {}; //save action details

	$scope.commentPoints = 1; 
	$scope.feedbackPoints = 1;        

	$scope.households = {}; //save information of households

	$scope.users = {}; //save user details. not the current user, the other household members and invited members 


  $scope.currentUser = currentUser;


	$scope.loadHouseholdsDetails = function(households) {

		for (var i=0; i < households.length; i++) {
			$scope.loadHouseholdProfile(households[i]);
		}

	}

	$scope.loadHouseholdProfile = function(householdId, cb){

		if (householdId === null) return; 

		Household.get({id: householdId}).$promise.then(function(data){

			$scope.households[householdId] = data; 

			$scope.loadUsersDetails(data.members);
			$scope.loadUsersDetails(data.pendingInvites);
			$scope.loadUserProfile(data.ownerId);

			console.log("load household data");
			console.log($scope.households); 

			if (typeof cb === 'function') cb(); 
		});
	}


	$scope.loadUsersDetails = function(users) {

		for (var i=0; i < users.length; i++) {
			$scope.loadUserProfile(users[i]);
		}
	}


	$scope.loadUserProfile = function(userId) {

		if (userId === null || userId === $scope.currentUser._id || $scope.users[userId]) return; 

		User.getUserProfile({userId : userId}).$promise.then(function(data){
			$scope.users[userId] = data; 
			$scope.loadActionDetails($scope.users[userId].actions.inProgress); 
			console.log("profile:");
			console.log(data);
		});
	}

	$scope.toRehearseSelectAll = function() {
		$scope.currentUser.profile.toRehearse = { 
			setByUser: true, 
			declined: true, 
			done: true, 
			na: true
		}; 
	}

	$scope.toRehearseDeselectAll = function() {
		$scope.currentUser.profile.toRehearse = { 
			setByUser: true, 
			declined: false, 
			done: false, 
			na: false
		}; 
	} 

	$scope.toRehearseSet = function() {
		$scope.currentUser.profile.toRehearse.setByUser = true; 
	} 
	$scope.isSetRehearse = function() {
		return $scope.currentUser.profile.toRehearse.setByUser; 
	}

	$scope.isToRehearse = function() {
		var a = $scope.currentUser.profile.toRehearse; 
		return a.setByUser && (a.declined || a.done || a.na); 
	}

	$scope.isNotToRehearse = function() {
		var a = $scope.currentUser.profile.toRehearse; 
		return a.setByUser && !a.declined && !a.done && !a.na; 
	}

	$scope.loadActionDetails = function(actions){

		//console.log("is array " + _.isArray(actions) + " " + JSON.stringify(actions, null, 4));
		if (_.isArray(actions)){
			for (var i=0; i< actions.length; i++) {
				$scope.addActionById(actions[i]._id);
			}
		}else{
			for (var action in actions) {
				$scope.addActionById(action);
			}
		}
	}
	
	$scope.addActionById = function(actionId, cb){

		if (!$scope.actions[actionId]){
			Actions.getActionById({id:actionId}).$promise.then(function(data){
				
				$scope.actions[data._id] = data;

				console.log("action details");
				console.log($scope.actions); 

				$scope.$broadcast('Action loaded', {actionId: data._id}); 

				if (typeof cb === 'function') cb(); 
			});
		}else if (typeof cb === 'function') cb(); 
	}

	//update local list 
	$scope.removeActionById = function(actionId){

		if ($scope.actions[actionId]){

			delete $scope.actions[actionId];
			console.log("delete action details");
			console.log($scope.actions); 
		}
	}

	$scope.isInvitedToHousehold = function(userId){ 

		if ($scope.currentUser.householdId && 
			_.indexOf($scope.households[$scope.currentUser.householdId].pendingInvites, userId) > -1) { 
			return true; 
		} else return false; 
	}

	$scope.isInYourHousehold = function(userId){ 

		if ($scope.currentUser.householdId && 
			_.indexOf($scope.households[$scope.currentUser.householdId].members, userId) > -1) { 
			return true; 
		} else return false; 
	}

	$scope.addFeedbackPoints = function(){
		$scope.currentUser.leaves += $scope.feedbackPoints; 
	}

	$scope.addCommentPoints = function(){
		$scope.currentUser.leaves += $scope.commentPoints; 
	}

	$scope.deductCommentPoints = function(){
		$scope.currentUser.leaves -= $scope.commentPoints; 
	}

	$scope.addActionPoints = function(action){
		$scope.currentUser.leaves += action.impact + action.effort; 
	}

	$scope.getActionPoints = function(action){
		return action.effort + action.impact; 
	};

	$scope.salut = function(){
		var name = $scope.currentUser.profile.name? $scope.currentUser.profile.name : $scope.currentUser.email; 
		return $translate.instant('Hi') + ' ' + name + '!';
	}

	$scope.gotoYourActions = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("main.actions.yours");
	}

	$scope.gotoHouseholdActions = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("main.actions.household");
	}


	$scope.gotoSettings = function() {
		// $ionicHistory.nextViewOptions({
		// 	disableBack: true
		// });
		$ionicViewSwitcher.nextDirection('forward'); // forward, back, enter, exit, swap
		$state.go("main.settings.index");
	}

	$scope.gotoYourSettings = function() {
		// $ionicHistory.nextViewOptions({
		// 	disableBack: true
		// });
		$ionicViewSwitcher.nextDirection('forward'); // forward, back, enter, exit, swap
		$state.go("main.settings.personal");
	}

	$scope.disableBack = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
	}


	$scope.goBack= function() {
		$ionicHistory.goBack();
	}


	$scope.toSignout = false; 

	$scope.isToSignout = function(){
		return $scope.toSignout; 
	}

	$scope.clearToSignout = function(){
		$scope.toSignout = false; 
	}

	$scope.profileChanged = {
		personal: false, 
		houseInfo: false,
		householdComposition: false,
		appliancesList: false
	};

	$scope.isProfileChanged = function(){
		return $scope.profileChanged.personal || $scope.profileChanged.houseInfo || $scope.profileChanged.householdComposition || $scope.profileChanged.appliancesList; 
	},
	$scope.setHouseInfoChanged = function() {
		$scope.profileChanged.houseInfo = true;
	},
	$scope.setHouseholdCompositionChanged = function() {
		$scope.profileChanged.householdComposition = true;
	},
	$scope.setAppliancesListChanged = function() {
		$scope.profileChanged.appliancesList = true;
	},
	$scope.clearHouseholdProfileChanged = function() {
		$scope.profileChanged.houseInfo = false,
		$scope.profileChanged.householdComposition = false,
		$scope.profileChanged.appliancesList = false
	},
	$scope.isHouseholdProfileChanged = function() {
		return $scope.profileChanged.houseInfo || $scope.profileChanged.householdComposition || $scope.profileChanged.appliancesList; 
	},
	$scope.isHouseInfoChanged = function() {
		return $scope.profileChanged.houseInfo;
	},
	$scope.isHouseholdCompositionChanged = function() {
		return $scope.profileChanged.householdComposition;
	},
	$scope.isAppliancesListChanged = function() {
		return $scope.profileChanged.appliancesList;
	},

	$scope.setPersonalProfileChanged = function(){
		$scope.profileChanged.personal = true; 
	}

	$scope.clearPersonalProfileChanged = function(){
		$scope.profileChanged.personal = false; 
	}

	$scope.isPersonalProfileChanged = function(){
		return $scope.profileChanged.personal; 
	}


	$scope.signout = function() {

		if ($scope.isProfileChanged()){
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

		$timeout(function () {
	        $ionicHistory.clearCache();
	        $ionicHistory.clearHistory();
	    }, 1500)
	}

	$scope.showLoading = function() {
		console.log("show loading"); 
		$ionicLoading.show({
		  	template: '<ion-spinner icon="ion-load-a"></ion-spinner>',
    		hideOnStageChange: true
		});
	};
	$scope.hideLoading = function(){
		console.log("hide loading");
		$ionicLoading.hide();
	};


  // Load all additional user information

  if ($scope.currentUser.profile.dob && $scope.currentUser.profile.dob !== null){
    $scope.currentUser.profile.dob = new Date($scope.currentUser.profile.dob);
  }

  $translate.use($scope.currentUser.profile.language);

  //whether the user wants to rehearse the actions, inite the variable
  //this can be loaded from the backend TODO post the data to the backend
  //$scope.currentUser.profile.toRehearse = { setByUser: false } ;
  //$scope.currentUser.profile.language = 'English' ;

  //get the user's picture
  User.getPicture({userId: $scope.currentUser._id}).$promise.then(function(data){

    console.log("user picture TODO");
    //console.log(data);
    var b64 = btoa(data); //this doesnot work
    //console.log(b64);
    $scope.userPictures[$scope.currentUser._id] = ({_id: $scope.currentUser._id, image: b64});
    //console.log($scope.userPictures);
  });

  

  //comments are loaded later automatically at the action details view

  console.log("user data");
  console.log($scope.currentUser);

};
