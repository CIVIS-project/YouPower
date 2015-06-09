controllers.controller('TabCtrl', TabCtrl);


function TabCtrl($scope,$firebaseArray,$ionicHistory, $state, $ionicPopup) {

	$scope.nextTip = function(user,backToActions) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    //TO FIX: the user.actionsActive is not always up to date
    // therefore the size calculation can sometimes be wrong
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
      //todo: choose next action
  }

}; 