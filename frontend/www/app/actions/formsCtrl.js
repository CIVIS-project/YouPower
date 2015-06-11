
controllers.controller('FormsCtrl', FormsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams, $ionicHistory, $firebaseObject, $ionicPopup) { 

	$scope.actionId = $stateParams.id;

	$scope._act;

	$scope.bonus; 


	$scope.setBonus=function(points){
		$scope.bonus=Math.round(points/5);
	};

	//ionic rating 
	$scope.rating = 4;
	$scope.data = {
		rating : 0,
		max: 5
	}

	$scope.$watch('data.rating', function() {
		console.log('New value: '+$scope.data.rating);
	});  


	$scope.goForward= function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('tab.actions');
	} 


	$scope.goBack= function() {
		$ionicHistory.goBack();
	}

	$scope.setPoints = function(points) {
		var userRef = new Firebase(endev.firebaseProvider.path + "users/" + $scope.user.$id);
		$firebaseObject(userRef).$loaded().then(function(object){
			object.points = points;
			object.$save();
		});
	}

	$scope.completed = function(user){
		var alertPopup = $ionicPopup.confirm({
	       title: 'Action completed',
	       template: 'Do you want to add another action?',
	       okText: "Yes",
	       cancelText: "Not now",
	       okType: "button-balanced"
	     });
	     alertPopup.then(function(res) {
	       if(res) {
	       	$scope.nextTip(user);
	       }else {
	       	$state.go("tab.actions");
	       }
	     });
	}

	$scope.abandoned = function(user){
		var alertPopup = $ionicPopup.confirm({
	       title: 'Action removed',
	       template: 'Do you want to add another action instead?',
	       okText: "Yes",
	       cancelText: "Not now",
	       okType: "button-balanced"
	     });
	     alertPopup.then(function(res) {
	       if(res) {
	       	$scope.nextTip(user);
	       }else {
	       	$state.go("tab.actions");
	       }
	     });
	}  
};


