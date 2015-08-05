angular.module('civis.youpower.main',[]).controller('AppCtrl', AppCtrl);

/* The controller that should always be on top of routing
hierarchy as it will be loaded with abstract main state.
Here we can do the general app stuff like getting the user's
details (since this is after the user logs in).
----------------------------------------------*/
function AppCtrl($scope,User,Actions) {

	User.get().$promise.then(function(data) {
		
		$scope.currentUser = data;
		$scope.loadComments($scope.currentUser.actions); 

		console.log("load user data");
		console.log($scope.currentUser); 
	});


	$scope.loadComments = function(actions){

		$scope.comments = []; 

		for (var actionType in actions) {
			if (actions.hasOwnProperty(actionType)) {
				for (var key in actions[actionType]) {
					if (actions[actionType].hasOwnProperty(key)) {
						var action = actions[actionType][key]
						Actions.getComments({actionId: action._id}).$promise.then(function(data){

							$scope.comments = $scope.comments.concat(data);
							console.log($scope.comments); 

						});
					}
				}
			}
		}
		//console.log(comments); 
		//return comments; 
	}

	$scope.salut = function(){
		if ($scope.currentUser.profile.name) {
			return 'Hi, ' + $scope.currentUser.profile.name + '! ';
		}
		else return ''; 
	}


};
