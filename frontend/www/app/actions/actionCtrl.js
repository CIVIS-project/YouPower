
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state, Actions, User) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.action._id);
  }

  // if ($scope.$parent.idx > -1){
  //    $scope.action = $scope.$parent.suggestedActions[$stateParams.id];
  // }



  // $scope.addAction = function(){
  //   User.startAction({actionId: $scope.action._id, state:'done'}).then(function(){
  //     // We do this so we don't need to refresh the whole user every time.
  //     if(!$scope.currentUser.actions.inProgress) $scope.currentUser.actions.inProgress = [];
  //     $scope.currentUser.actions.inProgress.push($scope.action);
  //     $state.go('main.actions.index');
  //   });
  // };

  // $scope.skipAction = function(reason){
  //   // TODO: not implemented on backend
  // }

  //I have no idea why this works, idx and suggestedActions are in the parent scope? 

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

