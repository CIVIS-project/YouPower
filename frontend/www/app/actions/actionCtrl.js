
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state, User) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.action._id);
  }

  // if ($scope.$parent.idx > -1){
  //    $scope.action = $scope.$parent.suggestedActions[$stateParams.id];
  // }



  $scope.addAction = function(){

    //t he same as below 
    // User.actionState(
    //     {actionId: $scope.action._id}, 
    //     {state:'inProgress'}, 
    //     function(){
    //       $scope.currentUser.actions.inProgress[$scope.action._id] = $scope.action;
    // });

    User.actionState(
        {actionId: $scope.action._id},{state:'inProgress'}).$promise.then(function(){
          $scope.currentUser.actions.inProgress[$scope.action._id] = $scope.action;
    });


    $state.go('main.actions.yours');

  };

  // $scope.skipAction = function(reason){
  //   // TODO: not implemented on backend
  // }

  $scope.nextTip = function(){

    $scope.$parent.idx++;

    if (_.size($scope.$parent.suggestedActions) > $scope.$parent.idx){

      //$state.go('main.actions.action', {id:$scope.$parent.idx});
      $state.go('main.actions.action');
      
    }else{
      console.log("TODO: need to load more actions");
      $scope.$parent.idx = -1;
    }
  }



};

