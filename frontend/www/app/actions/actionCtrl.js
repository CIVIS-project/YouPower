
angular.module('civis.youpower.actions').controller('ActionCtrl', ActionCtrl);

function ActionCtrl($scope, $stateParams, $ionicPopup, $state) {

  if ($scope.$parent.idx > -1){
     $scope.action = $scope.$parent.suggestedActions[$scope.$parent.idx];
     console.log($scope.$parent.idx + " " + $scope.action._id);
  }

  $scope.input = {}; 

  $scope.changed = function(){
    console.log($scope.input.days);
  }

  $scope.inputDays = function(){

    var alertPopup = $ionicPopup.show({
      title: "<span class='text-medium-large'>Set a Pending Action</span>",
      scope: $scope, 
      template: "<form name='popup' class='text-medium text-center'>Remind me of this action in <div><input name='inputDays' type='number' min='1' max='1000' class='text-center' ng-model='input.days' placeholder='a number of'> days </div> <div class='errors' ng-show='!popup.inputDays.$valid'>Please give a number between 1 and 1000!</div></form>", 
      buttons: [
        { text: 'Cancel' },
        { text: 'Save',
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.input.days) {
              //don't allow the user to close unless he enters a number
              e.preventDefault();
            } else {  return $scope.input.days; }
          }
        }
      ]
    });
    alertPopup.then(function(res) {
      if(res) {
        $scope.setPendingAction(res); 
      }
    });
  }


  $scope.addDays = function(days){

    var date = new Date(); 

    if (days && _.isNumber(days)){
      date.setDate(date.getDate() + days);
    }

    console.log(date);

    return date; 
  }


  $scope.setPendingAction = function(pendingDays) {
    
      console.log(pendingDays);

      $scope.chooseSuggestedAction('pending', $scope.addDays(pendingDays)); 
  }

  $scope.chooseSuggestedAction = function(actionState, date) {

    $scope.setSuggestedActionStateWithPreload($scope.action._id, actionState, date); 

    if (actionState == "declined" || actionState == "na") {

      $scope.removeActionById($scope.action._id);

    }else{

      if (actionState == "alreadyDoing"){
        $scope.addActionPoints($scope.action);
      }

      $scope.loadCommentsByActionId($scope.action._id); 
    }

    $scope.gotoYourActions();

  };

};

