angular.module('civis.youpower.main',[]).controller('AppCtrl', AppCtrl);

/* The controller that should always be on top of routing
hierarchy as it will be loaded with abstract main state.
Here we can do the general app stuff like getting the user's
details (since this is after the user logs in).
----------------------------------------------*/
function AppCtrl($scope,User,Actions) {


	$scope.userPictures = {}; 

	$scope.comments = []; 

	$scope.actions = {}; 


	User.get().$promise.then(function(data) {

		$scope.currentUser = data;

		//get user picture
		User.getPicture({userId: $scope.currentUser._id}).$promise.then(function(data){
			
			console.log("user picture TODO");
			//console.log(data); 
			var b64 = btoa(data); //this doesnot work 
			//console.log(b64); 
			$scope.userPictures[$scope.currentUser._id]=({_id: $scope.currentUser._id, image: b64});
			//console.log($scope.userPictures); 

		});

		$scope.loadComments($scope.currentUser.actions); 

		$scope.loadActionDetails($scope.currentUser.actions.inProgress); 

		console.log("user data");
		console.log($scope.currentUser); 
	});



	$scope.loadActionDetails = function(actions){
		for (var action in actions) {
			Actions.getActionById({id:action}).$promise.then(function(data){
				$scope.actions[data._id] = data;

				console.log("actions");
				console.log($scope.actions); 
			});
		}
	}


	$scope.loadComments = function(actions){

		for (var actionType in actions) {
			if (actions.hasOwnProperty(actionType)) {
				for (var key in actions[actionType]) {
					if (actions[actionType].hasOwnProperty(key)) {
						var action = actions[actionType][key]
						Actions.getComments({actionId: action._id}).$promise.then(function(data){

							$scope.comments = $scope.comments.concat(data);

							console.log("comments");
							console.log($scope.comments); 

							data.forEach(function(comment) {
								//load user picture

								

							    //console.log(comment);

							});


						});
					}
				}
			}
		}
	}

	$scope.salut = function(){
		if ($scope.currentUser.profile.name) {
			return 'Hi, ' + $scope.currentUser.profile.name + '! ';
		}
		else return ''; 
	}


};
