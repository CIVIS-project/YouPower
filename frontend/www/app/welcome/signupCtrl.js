angular.module('civis.youpower.welcome').controller('SignupCtrl', SignupCtrl);


function SignupCtrl($translate, $scope, $state, $stateParams, $ionicPopup, AuthService, testbed, cooperative) {

  $scope.testbed = testbed;
  $scope.cooperative = cooperative;

  if (AuthService.isAuthenticated()) {
      $state.go('main.actions.yours');
  }

  $scope.loginData = {
      emailAddress:'',
      password:'',
      err: '',
      fbErr: '',
      language: 'English',
      testLocation: '',
      contractId: ''
  };

  if(testbed && testbed.isStockholm()) {
    $translate.use('Swedish');
    $scope.loginData.language = 'Swedish';
    $scope.loginData.testbed = testbed._id;
    $scope.loginData.household = {
      composition : {},
      testbed: testbed._id,
      extraInfo: {}
    };
    if(cooperative) {
      $scope.loginData.household.cooperativeId = cooperative._id;
    }
  }



  $scope.comparePasswords = function(){
    if ($scope.loginData.password && $scope.loginData.password2 &&
        $scope.loginData.password === $scope.loginData.password2) {
      $scope.isPasswordsSame = true;
    }else{
      $scope.isPasswordsSame = false;
    }
  }

  $scope.isPasswordsSame = $scope.comparePasswords();

  $scope.signinClicked = false;
  $scope.isRejected = false;

  $scope.clearSigninClicked = function(){
    $scope.signinClicked = false;
    $scope.isRejected = false;
  }


  $scope.signup = function(err) {

    $scope.signinClicked = true;

    if (_.isEmpty(err) && $scope.isPasswordsSame){

        AuthService.signup($scope.loginData.emailAddress.toLowerCase(), $scope.loginData.name, $scope.loginData.password, $scope.loginData.language, $scope.loginData.testLocation, $scope.loginData.contractId, $scope.loginData.household)
        .then(function(data){

          $scope.signinClicked = false;
          if($scope.testbed && $scope.testbed.isStockholm()) {
            $state.go('main.cooperative.my');
          } else {
            $state.go('main.actions.yours');
          }

        }, function(err){
          $scope.isRejected = true;
          $scope.loginData.err = err;
        })
      }
  }

  $scope.languageChanged = function () {
    $translate.use($scope.loginData.language);
  };
  $scope.testLocationChanged = function() {
    $translate.use($scope.loginData.testLocation);
  };

  $scope.showInfoPopup = function(cooperative, label) {
    $ionicPopup.alert({
      title: $translate.instant(label),
      template: $translate.instant(label + '_DESCRIPTION_' + cooperative.getStringId()),
    })
  }

  $scope.showSmappeeInfo = function(cooperative) {
    $ionicPopup.alert({
      title: $translate.instant('SMAPPEE_INFO_TITLE'),
      template: $translate.instant('SMAPPEE_INFO_TEXT'),
    })
  }

};


