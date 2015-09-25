
angular.module('civis.youpower.settings').controller('HouseholdSettingsCtrl', HouseholdSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdSettingsCtrl($scope, $filter, $translate, $state, $timeout, $ionicScrollDelegate) {

	$scope.input = {err: ''};

	$scope.addAppliance= function() {

		$scope.input.err = ''; 

		if ($scope.input.description === '') return; 

		if ($scope.households[$scope.currentUser.householdId].appliancesList.indexOf($scope.input.description) < 0 ) {

			$scope.households[$scope.currentUser.householdId].appliancesList.push($scope.input.description); 
			$scope.input.description = '';

			$scope.setAppliancesListChanged();

		}else{
			$scope.input.err = 'ALREADY_EXISTS'; 
		}

		$ionicScrollDelegate.scrollBottom(); 
	}

	$scope.removeAppliance= function(index) {

		$scope.input.description = $scope.households[$scope.currentUser.householdId].appliancesList[index]; 
		$scope.households[$scope.currentUser.householdId].appliancesList.splice(index, 1);

		$scope.setAppliancesListChanged();

	}

	// $scope.doRefresh = function() {
	//     $http.get('/new-items')
	//      .success(function(newItems) {
	//        $scope.items = newItems;
	//      })
	//      .finally(function() {
	//        // Stop the ion-refresher from spinning
	//        $scope.$broadcast('scroll.refreshComplete');
	//      });
	//   };

	//  $scope.doRefresh = function() {
	//     //$scope.todos.unshift({name: 'Incoming todo ' + Date.now()})
	//     $scope.$broadcast('scroll.refreshComplete');
	//     $scope.$apply(); 
	//   };

	// $scope.doRefresh = function() {

	//     console.log('Refreshing!');
	//     $timeout( function() {
	//       //simulate async response
	//       //$scope.items.push('New Item ' + Math.floor(Math.random() * 1000) + 4);

	//       //Stop the ion-refresher from spinning
	//       $scope.$broadcast('scroll.refreshComplete');

	//     }, 1000);

 //  };

	// $scope.checkTab = function(){

	//     var active = $ionicTabsDelegate.selectedIndex();

	//     console.log('active:'+active);

	//     if (active === 0){
	//       $scope.doRefresh();
	//     }
	//     else{
	//       $ionicTabsDelegate.select(0);
	//     }
 //  }
	

};

