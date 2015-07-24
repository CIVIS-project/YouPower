angular.module('civis.youpower')

.factory('Actions', function($resource, $firebaseArray, AuthService, $q) {
  /* Dummy for old Firebase data
   ----------------------------------------------*/
  // return {
  //   get: function(filter) {
  //     return $q(function(resolve,reject) {
  //       var actionsRef = new Firebase('https://youpower.firebaseio.com/actions');
  //       $firebaseArray(actionsRef).$loaded().then(function(actions){
  //         resolve(
  //           _.find(actions,function(action){
  //             return action && filter.id == action.id;
  //           })
  //         );
  //       });
  //     })
  //   }
  // }

  /* Use this for real data
   ----------------------------------------------*/
  return $resource('http://civis.tbm.tudelft.nl/api/user/action/suggested');




});
