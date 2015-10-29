angular.module('civis.youpower.welcome').controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $state, $stateParams, AuthService) {

  if ($stateParams
    && $stateParams.token !== undefined
    && $stateParams.token !== "") {

    console.log("welcome params: " + JSON.stringify($stateParams, null, 4));

    if ($stateParams.token === 'fbUnauthorized'){
      fbErr = 'Unauthorized_Facebook_Login';
    }else if ($stateParams.token === 'err'){
      //err in generating a token
      fbErr = 'NO_TOKEN';
    }else{
      //save the token
      AuthService.fbLoginSuccess($stateParams.token);
      $state.go('main.actions.yours');
    }
  }else if (AuthService.isAuthenticated()) {
      $state.go('main.actions.yours');
  }

  $scope.loginData = {
      emailAddress:'',
      password:'',
      err: '',
      fbErr: '',
      language: 'English'
  };

  $scope.signinClicked = false;
  $scope.isRejected = false;

  $scope.clearSigninClicked = function(){
    $scope.signinClicked = false;
    $scope.isRejected = false;
  }

  $scope.signin = function() {

    $scope.signinClicked = true;

    AuthService.login($scope.loginData.emailAddress.toLowerCase(), $scope.loginData.password)
    .then(function(data){

      $scope.signinClicked = false;
      $state.go('main.actions.yours');

    }, function(err){
      $scope.isRejected = true;
      $scope.loginData.err = err;
    })
  }


  $scope.fbLogin = function(){
      $window.location.href = Config.host + "/api/auth/facebook" ;
  }

};


