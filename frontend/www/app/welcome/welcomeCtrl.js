angular.module('civis.youpower.welcome').controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $rootScope, $state, $ionicViewSwitcher, $window, $stateParams, AuthService, Config) {

	$scope.loginData = { 
      emailAddress:'', 
      password:'', 
      err: '', 
      fbErr: '', 
      language: 'English'
  }; 

  if ($stateParams && $stateParams.token !== '') {

    // console.log("welcome params: " + JSON.stringify($stateParams, null, 4));

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
  }

  // $scope.loginData.emailAddress = "foo";
  // $scope.loginData.password = "bar"; 

  // $scope.loginData.emailAddress = "yilin@gmx.us";
  // $scope.loginData.password = "barbar"; 
  // $scope.loginData.name = "Yilin";
  // $scope.loginData.password2 = "barbar"; 

  

  $scope.comparePasswords = function(){ 
    if ($scope.loginData.password && $scope.loginData.password2 && 
        $scope.loginData.password === $scope.loginData.password2) {
      $scope.isPasswordsSame = true; 
    }else{
      $scope.isPasswordsSame = false; 
    }
  }

  $scope.isPasswordsSame = $scope.comparePasswords(); 

  // $scope.loginData.emailAddress = 'civisuser@test.com';
  // $scope.loginData.password = "test";

  // $scope.loginData.emailAddress = "testuser5@test.com";
  // $scope.loginData.password = "topsecret50"; 

  $scope.signinClicked = false; 
  $scope.isRejected = false; 

  $scope.clearSigninClicked = function(){
    $scope.signinClicked = false;
    $scope.isRejected = false; 
  }
	
	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

  

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

  $scope.signup = function(err) {

    $scope.signinClicked = true; 

    if (_.isEmpty(err) && $scope.isPasswordsSame){

        AuthService.signup($scope.loginData.emailAddress.toLowerCase(), $scope.loginData.name, $scope.loginData.password, $scope.loginData.language)
        .then(function(data){

          $scope.signinClicked = false; 
          $state.go('main.actions.yours'); 

        }, function(err){ 
          $scope.isRejected = true; 
          $scope.loginData.err = err; 
        })
      }
  }

  $scope.fbLogin = function(){
      $window.location.href = Config.host + "/api/auth/facebook" ; 
  }


  $scope.gotoSignin = function(){
      $ionicViewSwitcher.nextDirection('swap'); // forward, back, enter, exit, swap
      $state.go('welcome'); 
  }

  $scope.gotoSignup = function(){
      $ionicViewSwitcher.nextDirection('swap'); // forward, back, enter, exit, swap
      $state.go('signup'); 
  }

  $scope.languageChanged = function () {
    $translate.use($scope.loginData.language);
  };

};


