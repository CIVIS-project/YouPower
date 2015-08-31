
angular.module('civis.youpower.actions').controller('ActionsListCtrl', ActionsListCtrl);

/* The controller used for sliding slider over various action lists.
 ----------------------------------------------*/
function ActionsListCtrl($scope, $state, $stateParams, Actions) {

  $scope.slideIdx = $stateParams.index ? $stateParams.index : 0;

  $scope.comment = {text: '', show: false}

  $scope.actionsType = $stateParams.type;

  $scope.actionsByType = function(){

    if ($stateParams.type == 'active') {
      return $scope.currentUser.actions.inProgress;
    }
    if ($stateParams.type == 'done') {
      return $scope.currentUser.actions.done;
    }
  }


  $scope.postComment = function(action){

    Actions.postComment(
        {actionId: action._id},{comment:$scope.comment.text}).$promise.then(function(data){

          // console.log($scope.comment.text);
          // console.log(data);

          $scope.comment = {text: '', show: false}; 

          //add action to list 
          $scope.comments.unshift(data);

    });
  }

  //toggle like action
  $scope.likeAction = function(action){
    
    if (!action.userRating || action.userRating == 0){

      //like
      Actions.likeAction(
        {id: action._id}, {rating: 1}).$promise.then(function(data){

          action.userRating = 1; 
          action.numLikes++; 
      });

    }else{
      //unlike
      Actions.likeAction(
        {id: action._id}, {rating: 0}).$promise.then(function(data){

          action.userRating = 0; 
          action.numLikes--;
      });
    }
    
  }

  $scope.deleteComment = function(comment){

    Actions.deleteComment(
        {actionId: comment.actionId, commentId: comment._id }).$promise.then(function(data){

          // console.log(comment);
          // console.log(data);

          //delete action in list 
          $scope.comments.splice($scope.comments.indexOf(comment), 1);

    });
  }


  //toggle like comment 
  $scope.likeComment = function(comment){

    if (!comment.userRating || comment.userRating == 0)
    {
      //like
      Actions.likeComment(
        {actionId: comment.actionId, commentId: comment._id}, {rating: 1}).$promise.then(function(data){

          comment.userRating = 1;
          comment.numLikes++;

      });
    }else{
      //unlike
      Actions.likeComment(
        {actionId: comment.actionId, commentId: comment._id}, {rating: 0}).$promise.then(function(data){

          comment.userRating = 0;
          comment.numLikes--;

      });
    }

    
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

