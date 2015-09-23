
angular.module('civis.youpower.actions')
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
			console.log("invite now");
			$scope.households[data._id] = data;
		});
	}


	$scope.confirmToInvite = function(user){

		if (user._id === $scope.currentUser._id || 
			($scope.currentUser.householdId !== null 
				&& ($scope.isInvitedToHousehold(user._id) || $scope.isInYourHousehold(user._id))))
			return; 

		var title = "Confirm Invite";

		var alertPopup = $ionicPopup.confirm({
			title: "<span class='text-medium-large'>" + title + "</span>", 
			template: "<span class='text-medium'>You are about to invite " + user.profile.name + " to your household. If the person accepts your invite, you both will be able to see each other's actions, basic profile and household information. Would you like to continue?</span>",
			okText: "Yes",
			cancelText: "Cancel",
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

		$scope.search.input.typing = false; 
		$scope.email.showForm = false; 

		if (!$scope.search.input.text) return; 

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

