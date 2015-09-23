
angular.module('civis.youpower.actions').controller('HouseholdCtrl', HouseholdCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdCtrl($scope, $filter, $translate, $state, $window, $ionicPopup, Household) {

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
			//load the action 
			$scope.addActionById(action._id, function(){
				$state.go('main.actions.action', {id:action._id}); 
			});
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
			$scope.households[$scope.currentUser.householdId].members.length > 0) {

			$scope.showHasHousehold(householdId); 
		}else {
			$scope.confirmAccept(householdId); 
		}
	}

	$scope.createHousehold = function(){

		Household.create().$promise.then(function(data){ 
			$scope.currentUser.householdId = data._id; 
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

		var title = "Can not Accept Invitation";

		var alertPopup = $ionicPopup.alert({
			title: "<span class='text-medium-large'>" + title + "</span>",  
			scope: $scope, 
			template: "<span class='text-medium'>" + "You can not join the household of " + $scope.users[$scope.households[householdId].ownerId].profile.name + " now. If you want to do so, you need to first leave your current household. You can also ask " + $scope.users[$scope.households[householdId].ownerId].profile.name + " to join your household instead." + "</span>",
			okText: "OK, I see.", 
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
		}); 
	}


	$scope.confirmIgnore = function(householdId){

		if (householdId === null) return; 

		var title = "Ignore Invitation";

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium'>" + "You are about to reject the invitation from " + $scope.users[$scope.households[householdId].ownerId].profile.name + ". We will then remove the invitation from your list. Would you like to ignore the inviation?" + "</span>",
			okText: "Ignore",
			cancelText: "Cancel",
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

		var title = "Accept Invitation";

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium'>You are about to accept the invitation from "+  $scope.users[$scope.households[householdId].ownerId].profile.name + ". Afterwards you will become a member of that household. <span ng-show='currentUser.householdId !== null && households[currentUser.householdId].members.length === 0'>Your current household will be removed. </span>All members in the same household can see each other's actions, basic profile and household information. Would you like to continue?</span>",
			okText: "Accept",
			cancelText: "Cancel",
			okType: "button-dark"
		});				

		alertPopup.then(function(res) { 
			if (res){
				//accept 
				if ($scope.currentUser.householdId !== null && 
					$scope.households[$scope.currentUser.householdId].members.length === 0){

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

		var title = "Leave Household"; 
		var temp = null; 

		if ($scope.households[householdId].ownerId === userId){
			temp = "You are about to leave the household where you are an owner. The whole household (including the members and pending invitations if any) will be removed afterwards! Would you like to continue?"
		}else{
			temp = "You are about to leave the household of "+  $scope.users[$scope.households[householdId].ownerId].profile.name + ". Afterwards you will be no longer a member of that household. You may join a household later with an invitation or create your own. Would you like to continue?" 
		}

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>",
			template: "<span class='text-medium'>" + temp + "</span>",
			okText: "Yes",
			cancelText: "Cancel",
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
	}

	$scope.removeHousehold = function(householdId, cb) {

		if (householdId === null) return; 

		Household.delete({id: householdId}).$promise.then(function(data){ 
			
			console.log("remove household: ")
			console.log(data); 
			if (typeof cb === 'function') cb();

		});

	}

	//remove the current user from the household
	$scope.leaveHousehold = function(householdId, userId, cb) {

		if (householdId === null || userId === null) return; 

		Household.removeMember({householdId: householdId, userId: userId},{}).$promise.then(function(data){ 
			
			console.log("remove member: ")
			console.log(data); 
			if (typeof cb === 'function') cb(); 
		});
	}

	$scope.removeOwnHouseholdAndAcceptInvite = function(householdId){

		$scope.showLoading();

		Household.delete({id: $scope.currentUser.householdId}).$promise.then(function(data){ 
			
			console.log("remove own household: ")
			console.log(data); 
			delete $scope.households[$scope.currentUser.householdId]; 
			$scope.currentUser.householdId = null; 
			$scope.responseInvite(householdId, true); 
		});

	}


	$scope.responseInvite = function(householdId, accepted){

		Household.responseInvite({id: householdId, accepted: accepted},{}).$promise.then(function(data){

			console.log("accepted?: " + accepted);
			
			if (accepted){
				$scope.households[data._id] = data;
				$window.location.reload(true); 
				$scope.hideLoading(); 
			}else{
				delete $scope.households[data._id]; 
			}

			$scope.currentUser.pendingHouseholdInvites.splice($scope.currentUser.pendingHouseholdInvites.indexOf(householdId), 1); 
		});
	}

	// $scope.doRefresh = function() {
	    
	//     $scope.$broadcast('scroll.refreshComplete');
	//     $scope.$apply(); 
 //  	};

	

};

