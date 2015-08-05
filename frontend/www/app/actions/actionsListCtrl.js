
angular.module('civis.youpower.actions').controller('ActionsListCtrl', ActionsListCtrl);

/* The controller used for sliding slider over various action lists.
 ----------------------------------------------*/
function ActionsListCtrl($scope, $state, $stateParams, Actions) {

  $scope.slideIdx = $stateParams.index ? $stateParams.index : 0;

  $scope.comment = {text: ''}

  $scope.actionsType = $stateParams.type;

  $scope.actionsByType = function(){

    if ($stateParams.type == 'active') {
      return $scope.currentUser.actions.inProgress;
    }
    if ($stateParams.type == 'done') {
      return $scope.currentUser.actions.done;
    }
  }


  $scope.getComments = function(action){
    

  }


  $scope.postComment = function(action){

    Actions.postComment(
        {actionId: action._id},{comment:$scope.comment.text}).$promise.then(function(){

          console.log($scope.comment.text);
          console.log(action);


    });
  }

  // dont change state now, a user can still come back afterwards
  $scope.actionCompleted = function(action){

    $state.go('main.actions.completed', {id: action._id});

    
  }


  $scope.actionAbandoned = function(action){

    $state.go('main.actions.abandoned', {id: action._id});

    // User.actionState(
    //     {actionId: action.id},{state:'canceled'}).$promise.then(function(){

    //       $scope.currentUser.actions.declined[action.id] = action;
    //       delete $scope.currentUser.actions.inProgress[action.id]; 

    //       $state.go('main.actions.abandoned', {id: action.id});
    // });
  }

};

