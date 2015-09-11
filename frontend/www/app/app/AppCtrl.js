angular.module('civis.youpower.main',[]).controller('AppCtrl', AppCtrl);

/* The controller that should always be on top of routing
hierarchy as it will be loaded with abstract main state.
Here we can do the general app stuff like getting the user's
details (since this is after the user logs in).
----------------------------------------------*/
function AppCtrl($scope, $state, $ionicHistory, User,Actions) { 

	$scope.userPictures = {}; 

	$scope.comments = []; // save comments of actions 

	$scope.actions = {}; // save action details

	$scope.commentPoints = 1; 
	$scope.feedbackPoints = 1; 

	/*
	load the data of the user ($scope.currentUser)
	*/
	User.get().$promise.then(function(data){

		$scope.currentUser = data;

		//get the user's picture
		User.getPicture({userId: $scope.currentUser._id}).$promise.then(function(data){
			
			console.log("user picture TODO");
			//console.log(data); 
			var b64 = btoa(data); //this doesnot work 
			//console.log(b64); 
			$scope.userPictures[$scope.currentUser._id] = ({_id: $scope.currentUser._id, image: b64});
			//console.log($scope.userPictures); 
		});

		//$scope.loadAllComments($scope.currentUser.actions); 
		$scope.loadCommentsOfActions($scope.currentUser.actions.inProgress);
		$scope.loadCommentsOfActions($scope.currentUser.actions.pending);
		$scope.loadCommentsOfActions($scope.currentUser.actions.done);

		$scope.loadActionDetails($scope.currentUser.actions.inProgress); 
		$scope.loadActionDetails($scope.currentUser.actions.pending); 
		$scope.loadActionDetails($scope.currentUser.actions.done); 

		console.log("user data");
		console.log($scope.currentUser); 
	});



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

	//update local list
	$scope.addActionById = function(actionId){

		Actions.getActionById({id:actionId}).$promise.then(function(data){
			$scope.actions[data._id] = data;

			console.log("action details");
			console.log($scope.actions); 
		});
	}

	//update local list 
	$scope.removeActionById = function(actionId){

		delete $scope.actions[actionId];

		console.log("delelte action details");
		console.log($scope.actions); 
	}


	/*
		load comments of all actions in the user's actions lists
		actions: an object of a collection of objects of lists of actions
	*/
	$scope.loadAllComments = function(actions){

		//actionType in {declined, done, inProgress, na, pending}
		for (var actionType in actions) {
			if (actions.hasOwnProperty(actionType)) {
				$scope.loadCommentsOfActions(actions[actionType]);
			}
		}
	}

	/*
		actions: an object of a collection of indivudual action objects 
	*/
	$scope.loadCommentsOfActions = function(actions){
		for (var key in actions) {
			if (actions.hasOwnProperty(key)) {
				$scope.loadCommentsByActionId(actions[key]._id); 
			}
		}
	}


	$scope.loadCommentsByActionId = function(actionId){

		Actions.getComments({actionId: actionId}).$promise.then(function(data){

			$scope.comments = $scope.comments.concat(data);

			console.log("load comments");
			console.log(data); 

			data.forEach(function(comment) {
				//load user picture
			    //console.log(comment);
			});
		});
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

	$scope.disableBack = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
	}


	$scope.goBack= function() {
		$ionicHistory.goBack();
	}


};
