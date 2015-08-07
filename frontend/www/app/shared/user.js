angular.module('civis.youpower')

.factory('User', function($resource, $firebaseArray, $firebaseObject, AuthService, $q) {
  /* Dummy for old Firebase data, should be just removed (if it doesn't work don't try to fix
  instead just focus on making the backend API work)
   ----------------------------------------------*/
  // return {
  //   get: function(filter) {
  //     return $q(function(resolve,reject) {
  //       var userRef = new Firebase('https://youpower.firebaseio.com/users');
  //       userRef.child(AuthService.getToken()).once('value',function(data){
  //         var user = data.val();
  //         user.actions = {};
  //         // Map the actionsActive to backend API structure user.actions.inProgress
  //         $firebaseArray(userRef.child(AuthService.getToken()).child('actionsActive')).$loaded().then(function(userActions){
  //           var actionsRef = new Firebase('https://youpower.firebaseio.com/actions');
  //           $firebaseArray(actionsRef).$loaded().then(function(actions){
  //             user.actions.inProgress = _.filter(actions,function(action){
  //                 return _.find(userActions,function(userAction){
  //                   return userAction && action && userAction.id == action.id
  //                 })
  //               })
  //           });
  //         });
  //         // Map the actionsDone to backend API structure user.actions.done
  //         $firebaseArray(userRef.child(AuthService.getToken()).child('actionsDone')).$loaded().then(function(userActions){
  //           var actionsRef = new Firebase('https://youpower.firebaseio.com/actions');
  //           $firebaseArray(actionsRef).$loaded().then(function(actions){
  //             user.actions.inProgress = _.filter(actions,function(action){
  //                 return _.find(userActions,function(userAction){
  //                   return userAction && action && userAction.id == action.id
  //                 })
  //               })
  //           });
  //         });
  //         resolve(user);
  //       })
  //     })
  //   },
  //   startAction: function(filter) {
  //     return $q(function(resolve, reject){
  //       var userRef = new Firebase('https://youpower.firebaseio.com/users');
  //       $firebaseArray(userRef.child(AuthService.getToken()).child('actionsActive')).$add({
  //         id:filter.id,
  //         data: Date.now().toString()
  //       }).then(resolve,reject);
  //     });
  //   }
  // }

  /* Use this for real data
   ----------------------------------------------*/
  return $resource(HOST + '/api/user/profile', {}, {
    actionState : {
      method: 'POST', 
      url: HOST + '/api/user/action/:actionId'
    },
    feedback : {
      method: 'POST', 
      url: HOST + '/api/feedback'
    },
    getPicture : {
      method: 'GET', 
      url: HOST + '/api/user/profilePicture/:userId'
    }
  });
});
