
angular.module('civis.youpower.actions').controller('ActionsListCtrl', ActionsListCtrl);

/* The controller used for sliding slider over various action lists.
 ----------------------------------------------*/
function ActionsListCtrl($scope, $state, $stateParams, Actions) {

  $scope.slideIdx = $stateParams.index ? $stateParams.index : 0;

  $scope.actionsType = $stateParams.type;

  $scope.actionsByType = function(){
    if ($stateParams.type == 'active') {
      return $scope.currentUser.actions.inProgress;
    }
    if ($stateParams.type == 'Done') {
      return $scope.currentUser.actions.done;
    }
  }

};

