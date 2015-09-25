
angular.module('civis.youpower.actions') 
.controller('MemberCtrl', MemberCtrl);


function MemberCtrl($scope, $filter, $translate, $state, $ionicPopup, User, Household) {

	$scope.search = {
		input: {text: '', typing:false}, 
		noResult: false, 
		users: []
	};

	$scope.email = {
		sent: false, 
		err: false, 
		showForm: false,
	}; 

	$scope.clearEmailHouseholdInput = function(){
		$scope.emailHouseholdInput = {
			email:'', 
			name:'', 
			message:''
		};
	}

	$scope.clearEmailHouseholdInput();


	$scope.inviteToHousehold = function(user) {

		//the user is the current user, do nothing
		if ($scope.currentUser._id === user._id) return; 

		if ($scope.currentUser.householdId === null) {
			$scope.createHousehold(user, $scope.invite);
		}else{
			$scope.invite(user);
		}
	}

	$scope.invite = function(user){ 

		$scope.loadUserProfile(user._id); 
		
		Household.invite({userId: user._id},{}).$promise.then(function(data){
			$scope.households[data._id] = data;
		});
	}


	$scope.confirmToInvite = function(user){

		if (user._id === $scope.currentUser._id || 
			($scope.currentUser.householdId !== null 
				&& ($scope.isInvitedToHousehold(user._id) || $scope.isInYourHousehold(user._id))))
			return; 

		var title = $translate.instant("Confirm Invite");

		$scope.name = user.profile.name; 

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			scope: $scope, 
			template: "<span class='text-medium' translate translate-values='{name:name}'>CONFIRM_INVITE</span>",
			okText: $translate.instant("Yes"),
			cancelText: $translate.instant("Cancel"),
			okType: "button-dark"
		});

		alertPopup.then(function(res) { 
			if (res){
				$scope.inviteToHousehold(user); 
			}
		}); 
	}

	$scope.createHousehold = function(user, cb){

		Household.create().$promise.then(function(data){ 
			$scope.currentUser.householdId = data._id; 
			$scope.households[data._id] = data; 
			//load more household details  
			$scope.loadHouseholdProfile(data._id); 
			if (typeof cb === 'function' && user) cb(user); 
		});
	}

	$scope.clearSearch = function(){
		$scope.search.input.text = '';
		$scope.search.noResult = false;
		$scope.email.showForm = false; 
	}

	$scope.searchUser = function(){

		if (!$scope.search.input.text) return; 

		$scope.search.input.typing = false; 
		$scope.email.showForm = false; 

		User.search({name: $scope.search.input.text}).$promise.then(function(data){

			$scope.search.noResult = data.length == 0? true: false; 
			console.log(data);
			$scope.search.users = data;
		});
	}

	$scope.sendMail = function(){

		$scope.email.showForm = false; 
		$scope.email.sending = true; 

	 	User.mailInvitation({type: 'householdMember'}, $scope.emailHouseholdInput).$promise.then(function(data){

			console.log(data);
			$scope.clearEmailHouseholdInput(); 

			$scope.email.sent = true; 
			$scope.email.to = data.to; 
			$scope.email.sending = false; 
		}, function(err){
			$scope.email.err = err; 
			console.log(err);
			$scope.email.sending = false; 
		});
	}
	

};

