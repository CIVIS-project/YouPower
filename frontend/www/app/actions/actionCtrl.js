
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.action._id);
  }


  $scope.changeActionState = function(actionState){

    $scope.postActionState($scope.action._id, actionState); 

    $scope.$parent.lastActionUsed = true; 

    //todo: need to be conditional 
    $state.go('main.actions.yours');

  };

};

