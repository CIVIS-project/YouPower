
angular.module('civis.youpower.settings').controller('HouseholdSettingsCtrl', HouseholdSettingsCtrl);

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function HouseholdSettingsCtrl($scope, $filter, $translate, $state, $timeout) {

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

	 $scope.doRefresh = function() {
	    //$scope.todos.unshift({name: 'Incoming todo ' + Date.now()})
	    $scope.$broadcast('scroll.refreshComplete');
	    $scope.$apply()
	  };

	$scope.doRefresh = function() {

	    console.log('Refreshing!');
	    $timeout( function() {
	      //simulate async response
	      //$scope.items.push('New Item ' + Math.floor(Math.random() * 1000) + 4);

	      //Stop the ion-refresher from spinning
	      $scope.$broadcast('scroll.refreshComplete');

	    }, 1000);

  };

	$scope.checkTab = function(){

	    var active = $ionicTabsDelegate.selectedIndex();

	    console.log('active:'+active);

	    if (active === 0){
	      $scope.doRefresh();
	    }
	    else{
	      $ionicTabsDelegate.select(0);
	    }
  }
	

};

