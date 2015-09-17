angular.module('civis.youpower.main',[]).controller('AppCtrl', AppCtrl);

/* The controller that should always be on top of routing
hierarchy as it will be loaded with abstract main state.
Here we can do the general app stuff like getting the user's
details (since this is after the user logs in).
----------------------------------------------*/
function AppCtrl($scope, $state, $ionicHistory, $ionicViewSwitcher, User, Actions, AuthService) { 

	$scope.userPictures = {}; 

	$scope.actions = {}; // save action details

	$scope.commentPoints = 1; 
	$scope.feedbackPoints = 1; 

	/*
	load the data of the user ($scope.currentUser)
	*/
	User.get().$promise.then(function(data){

		$scope.currentUser = data;

		if ($scope.currentUser.profile.dob && $scope.currentUser.profile.dob !== null){
			$scope.currentUser.profile.dob = new Date($scope.currentUser.profile.dob);
		}

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

		$scope.loadActionDetails($scope.currentUser.actions.inProgress); 
		$scope.loadActionDetails($scope.currentUser.actions.pending); 
		$scope.loadActionDetails($scope.currentUser.actions.done); 

		//comments are loaded later automatically at the action details view

		console.log("user data");
		console.log($scope.currentUser); 
	});

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

	
	$scope.addActionById = function(actionId){

		if (!$scope.actions[actionId]){
			Actions.getActionById({id:actionId}).$promise.then(function(data){
				
				$scope.actions[data._id] = data;

				console.log("action details");
				console.log($scope.actions); 
			});
		}
	}

	//update local list 
	$scope.removeActionById = function(actionId){

		if ($scope.actions[actionId]){

			delete $scope.actions[actionId];
			console.log("delete action details");
			console.log($scope.actions); 
		}
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
		return 'Hi, ' + name + '!';
	}

	$scope.gotoYourActions = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("main.actions.yours");
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
		return $scope.toSignout = false; 
	}

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
