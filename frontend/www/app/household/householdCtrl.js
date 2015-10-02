angular.module('civis.youpower.actions').controller('HouseholdCtrl', HouseholdCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdCtrl($scope, $filter, $translate, $state, $ionicPopup, $ionicScrollDelegate, User,Household) { 

	$scope.reloadCurrentHousehold = function() {

		User.getPendingInvites().$promise.then(function(data){
			$scope.currentUser.pendingHouseholdInvites = data.pendingHouseholdInvites;
			$scope.loadHouseholdsDetails($scope.currentUser.pendingHouseholdInvites);  
			$scope.currentUser.pendingCommunityInvites = data.pendingCommunityInvites;

		});

		if ($scope.currentUser.householdId === null) {
			$scope.$broadcast('scroll.refreshComplete'); 
			return; 
		}

		Household.get({id: $scope.currentUser.householdId}).$promise
		.then(function(data){

			$scope.households[$scope.currentUser.householdId] = data; 

			$scope.loadUsersDetails(data.members);
			$scope.loadUsersDetails(data.pendingInvites);
		})
		.finally(function() {
	       // Stop the ion-refresher from spinning
	       $scope.$broadcast('scroll.refreshComplete');
		}); 
	};

	$scope.reloadCurrentHousehold(); 


	$scope.addMember = function(){
		console.log("add member");
		$state.go('main.actions.addmember');
	}

	$scope.findAction = function(actions, action) { 

		for (var i = 0; i < actions.length; i++){
			if (actions[i]._id === action._id) return i; 
		}
		return -1; 
	}


	$scope.showAction = function(action) {

		var actions = []; 
		var index = 0; 
		if (_.has($scope.currentUser.actions.inProgress, action._id)) {
			index = $scope.findAction($scope.actionsByType('current'), action);
			$state.go('main.actions.details', {type: 'current', index: index});
		}else if (_.has($scope.currentUser.actions.done, action._id)) {
			index = $scope.findAction($scope.actionsByType('completed'), action);
			$state.go('main.actions.details', {type: 'completed', index: index});
		}else if (_.has($scope.currentUser.actions.pending, action._id)) {
			index = $scope.findAction($scope.actionsByType('pending'), action);
			$state.go('main.actions.details', {type: 'pending', index: index});
		}else{
			$state.go('main.actions.action', {id:action._id}); 
		}
	}

	$scope.checkAccept = function(householdId){

		// if ($scope.currentUser.householdId !== null) {

		// 	if ($scope.households[$scope.currentUser.householdId].members.length === 0) {
		// 		//join the current user to the other household
		// 		$scope.mergeHouseholds(householdId);
		// 	}else {
		// 		$scope.showHasHousehold(householdId); 
		// 	}
		// }else {
		// 	$scope.confirmAccept(householdId); 
		// } 

		if ($scope.currentUser.householdId !== null && 
			$scope.households[$scope.currentUser.householdId].members.length > 1) {

			$scope.showHasHousehold(householdId); 
		}else {
			$scope.confirmAccept(householdId); 
		}
	}

	$scope.createHousehold = function(){

		Household.create().$promise.then(function(data){ 
			$scope.currentUser.householdId = data._id; 
			console.log(data); 
			$scope.households[data._id] = data; 
			//load more household details  
			$scope.loadHouseholdProfile(data._id);
		});
	}

	//merge my household to householdId
	$scope.mergeHouseholds = function(householdId) {
		console.log('merge');
	}

	$scope.showHasHousehold = function(householdId){

		if (householdId === null) return; 
		
		$scope.name = $scope.users[$scope.households[householdId].ownerId].profile.name; 

		var title = $translate.instant("NOT_ACCEPT_INVITATION");

		var alertPopup = $ionicPopup.alert({
			title: "<span class='text-medium-large'>" + title + "</span>",  
			scope: $scope, 
			template: "<span class='text-medium' translate translate-values='{name: name}'>NOT_JOIN_HOUSEHOLD</span>",
			okText: $translate.instant("OK_I_C"), 
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
		}); 
	}


	$scope.confirmIgnore = function(householdId){

		if (householdId === null) return; 

		var title = $translate.instant("Ignore Invitation");

		$scope.name = $scope.users[$scope.households[householdId].ownerId].profile.name; 

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium' translate translate-values='{name: name}'>IGNORE_INVITATION</span>",
			okText: $translate.instant("Yes"),
			cancelText: $translate.instant("Cancel"),
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
			if (res){
				//reject
				$scope.responseInvite(householdId, false); 
			}
		}); 
	}

	$scope.confirmAccept = function(householdId){

		if (householdId === null) return; 

		var title = $translate.instant("Accept_Invitation");

		$scope.name = $scope.users[$scope.households[householdId].ownerId].profile.name; 

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium' translate translate-values='{name: name}'>ACCEPT_INVITATION</span>",
			okText: $translate.instant("Accept"),
			cancelText: $translate.instant("Cancel"),
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
			if (res){
				//accept 
				if ($scope.currentUser.householdId !== null && 
					$scope.households[$scope.currentUser.householdId].members.length === 1){

					$scope.removeOwnHouseholdAndAcceptInvite(householdId);
				}else{
					$scope.responseInvite(householdId, true); 
				} 
			}
		}); 
	}

	// confirm leave Your current household
	// the user is removing itself from the household  
	$scope.confirmLeaveCurrentHousehold = function(){

		if ($scope.currentUser.householdId === null || $scope.currentUser._id  === null) return; 

		var householdId = $scope.currentUser.householdId; 
		var userId = $scope.currentUser._id; 

		var title = $translate.instant("Leave_Household"); 
		var temp = null; 

		if ($scope.households[householdId].ownerId === userId){
			temp = "<span class='text-medium'>ASK_REMOVE_HOUSEHOLD</span>"; 
		}else{
			$scope.name = $scope.users[$scope.households[householdId].ownerId].profile.name; 
			temp = "<span class='text-medium' translate translate-values='{name:name}'>ASK_LEAVE_HOUSEHOLD</span>"; 
		}

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>",
			scope: $scope, 
			template: temp,
			okText: $translate.instant("Yes"),
			cancelText: $translate.instant("Cancel"),
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
			if (res){
				if ($scope.households[householdId].ownerId === userId){
					$scope.removeHousehold(householdId, 
						$scope.removeHouseholdLocal);
				}else{
					$scope.leaveHousehold(householdId, userId, 
						$scope.removeHouseholdLocal);
				}
			}
		}); 
	}


	//remove local current household data
	$scope.removeHouseholdLocal = function(){
		delete $scope.households[$scope.currentUser.householdId]; 
		$scope.currentUser.householdId = null; 
		$ionicScrollDelegate.scrollTop(); 
	}

	$scope.removeHousehold = function(householdId, cb) {

		if (householdId === null) return; 

		Household.delete({id: householdId}).$promise.then(function(data){ 
			
			if (typeof cb === 'function') cb();

		});

	}

	//remove the current user from the household
	$scope.leaveHousehold = function(householdId, userId, cb) {

		if (householdId === null || userId === null) return; 

		Household.removeMember({householdId: householdId, userId: userId},{}).$promise.then(function(data){ 
			console.log(data); 
			if (typeof cb === 'function') cb(); 
		});
	}

	$scope.removeOwnHouseholdAndAcceptInvite = function(householdId){

		$scope.showLoading();

		Household.delete({id: $scope.currentUser.householdId}).$promise.then(function(data){ 
			
			console.log(data); 
			delete $scope.households[$scope.currentUser.householdId]; 
			$scope.currentUser.householdId = null; 
			$scope.responseInvite(householdId, true); 
		});

	}

	$scope.responseInvite = function(householdId, accepted){

		Household.responseInvite({id: householdId, accepted: accepted},{}).$promise.then(function(data){
			
			if (accepted){
				$scope.households[data._id] = data;
				$scope.currentUser.householdId = data._id; 
				$scope.hideLoading(); 
			}else{
				delete $scope.households[data._id]; 
			}

			$scope.currentUser.pendingHouseholdInvites.splice($scope.currentUser.pendingHouseholdInvites.indexOf(householdId), 1); 
		});
	}

};

