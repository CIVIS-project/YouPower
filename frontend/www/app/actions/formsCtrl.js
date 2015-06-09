
controllers.controller('FormsCtrl', FormsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function FormsCtrl($scope, $timeout, $state, $stateParams, $ionicHistory, $firebaseObject, $firebaseArray) { 

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

};


