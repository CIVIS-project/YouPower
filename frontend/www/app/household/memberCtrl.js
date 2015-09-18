
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


function MemberCtrl($scope, $filter, $translate, $state, User) {

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

	$scope.clearSearch = function(){
		$scope.search.input.text = '';
		$scope.search.noResult = false;
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

