
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.$parent.idx + " " + $scope.action._id);
  }


  $scope.chooseSuggestedAction = function(actionState) {

    $scope.setSuggestedActionStateWithPreload($scope.action._id, actionState); 

    if (actionState == "declined" || actionState == "na") {

      $scope.removeActionById($scope.action._id);

    }else{

      if (actionState == "alreadyDoing"){
        $scope.addActionPoints($scope.action);
      }

      $scope.loadCommentsByActionId($scope.action._id); 
    }

    //todo: need to be conditional 
    $state.go('main.actions.yours');

  };

};

