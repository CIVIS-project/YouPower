
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $state, Actions, User) {

  Actions.get({id:$stateParams.id}).then(function(data){
    $scope.action = data;
  })

  $scope.addAction = function(){
    User.startAction({id:$scope.action.id}).then(function(){
      // We do this so we don't need to refresh the whole user every time.
      if(!$scope.currentUser.actions.inProgress) $scope.currentUser.actions.inProgress = [];
      $scope.currentUser.actions.inProgress.push($scope.action);
      $state.go('main.actions.index');
    });
  };

  $scope.skipAction = function(reason){
    // TODO: not implemented on backend
  }

};

