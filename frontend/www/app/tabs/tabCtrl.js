controllers.controller('TabCtrl', TabCtrl);


function TabCtrl($scope,$firebaseArray,$firebaseObject,$ionicHistory, $state, $ionicPopup) {

  $scope.nextTip = function(user,backToActions) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    var userRef = new Firebase(endev.firebaseProvider.path + "users/" + user.$id);

    $firebaseObject(userRef).$loaded().then(function(user){
        if(backToActions && user.actionsActive && _.size(user.actionsActive) >= user.preferredNrOfActions-1) {

          $state.go("tab.actions");
        
        } else {

          var actionsRef = new Firebase(endev.firebaseProvider.path + "actions/");
          $firebaseArray(actionsRef).$loaded().then(function(actions){
            possibleActions = _.shuffle(_.filter(actions,function(action){
              var eqalityFn = function(a) {
                return a.id == action.id;
              }

              return !_.find(user.actionsActive,eqalityFn) && 
              !_.find(user.actionsDone,eqalityFn) && 
              !_.find(user.actionsNotInterested,eqalityFn) && 
              !_.find(user.actionsNA,eqalityFn) && 
              !_.find(user.actionsDoing,eqalityFn) && 
              !_.find(user.actionsPending,eqalityFn) && 
              !_.find(user.actionsAbandoned,eqalityFn);
            }));

            
            if(_.size(possibleActions)==0) {
              var alertPopup = $ionicPopup.alert({
               title: 'No more actions',
               template: 'You have used all the actions',
               buttons: [{
                text: "OK",
                type: "button-balanced"
               }]
             });
             alertPopup.then(function(res) {
               $state.go("tab.actions");
             });
            }else {
              $state.go("tab.action",{id:possibleActions[0].id});
            }
          });
        }

      });
      //todo: choose next action
  }

  $scope.goToAction = function(user,id) {
    action = _.find(user.actionsActive,function(action){ return action.id == id});
    if(action) {
      $state.go("tab.action-details",{type:"Active", index: _.toArray(user.actionsActive).indexOf(action)});
    } else {
      $state.go("tab.action",{id:id});
    }

  }

}; 