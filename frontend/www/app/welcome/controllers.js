angular.module('civis.youpower.welcome').controller('PasswordRecoveryCtrl', PasswordRecoveryCtrl);


function PasswordRecoveryCtrl($scope,$stateParams,$state,$http,$translate,Config) {
  $scope.email = $stateParams.email;

  $scope.account = {};

  $scope.recover = function() {
    $scope.errorMsg = null;
    $http.post(Config.host + '/api/user/password_reset/',{email: $scope.account.email})
    .success(function(){
      $state.go('passwordRecoverySent');
    })
    .error(function(){
      $scope.errorMsg = $translate.instant('EMAIL_NOT_FOUND');
    })
  }

  $scope.resetPassword = function(){
    $scope.errorMsg = null;
    $http.put(Config.host + '/api/user/password_reset/' + $stateParams.token,{password: $scope.account.password})
    .success(function(){
      $state.go('welcome');
    })
    .error(function(){
      $scope.errorMsg = $translate.instant('RECOVERY_FAILD');
    })
  }
};


