
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state, User) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.action._id);
  }


  $scope.changeActionState = function(actionState){

    var listName = actionState; 

    //see https://github.com/CIVIS-project/YouPower/issues/59
    if (actionState == 'alreadyDoing'){
      listName = 'done';
      $scope.action.alreadyDoing = true;
    }



    User.actionState( //POST state
        {actionId: $scope.action._id},{state:actionState}).$promise.then(function(){
          //update local object 
          $scope.currentUser.actions[listName][$scope.action._id] = $scope.action;
    });

    $scope.$parent.lastActionUsed = true; 

    //todo: need to be conditional 
    $state.go('main.actions.yours');

  };

};

