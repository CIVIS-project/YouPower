mixpanel = {
  track: angular.noop
}

angular.module('civis.youpower',[])
angular.module('civis.youpower.admin', [
  'ui.router',
  'ngSanitize',
  'ngResource',
  'civis.youpower',
  'ui.bootstrap',
  'pascalprecht.translate',
  'civis.youpower.translations',
  'highcharts-ng',
])

.run(function($rootScope, $location, $state, AuthService) {

  $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams, fromState, fromParams) {

    var isLogin = toState.name === "login";
    AuthService.isAdmin().then(function(){
      if(isLogin) {
        e.preventDefault();
        $state.go('main');
      }
    },function(){
      if(!isLogin){
        e.preventDefault();
        $state.go('login');
      }
    })
  });

  $rootScope.$on('$stateChangeError', function(event, next, nextParams, fromState, fromParams, error) {
    console.error("State Change error occurred!");
    console.error(arguments);
  });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {
  $translateProvider.useSanitizeValueStrategy('sanitize');

  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "AdminLoginController"
  })

  .state('main',{
    url: "",
    templateUrl: "templates/main.html",
    controller: "MainController",
  })

  .state('main.households',{
    url: "/households",
    templateUrl: "templates/households.html",
    controller: 'HouseholdsController',
    params: {
      household: null
    },
  })
  .state('main.cooperatives',{
    url: "/cooperatives",
    templateUrl: "templates/cooperatives.html",
    controller: 'CooperativesController',
    params: {
      household: null
    },
  })


  //$urlRouterProvider.otherwise('/app/actions/yours');
  $urlRouterProvider.otherwise('');

})

.controller('AdminLoginController', function ($scope, $state, AuthService) {

  $scope.loginData = {};

  $scope.signin = function() {

    AuthService.loginAdmin($scope.loginData.email.toLowerCase(), $scope.loginData.password)
    .then(function(data){

      $state.go('main');

    }, function(err){

      //TODO show error
    })
  }

})

.controller('MainController',function($scope, $state, AuthService){
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  }

  $scope.equalOrEmpty = function(property,expected){
    return function(value){
      if (!expected)
        return true
      else
        return angular.equals(value[property], expected);
    }
  }
})

.controller('SmappeeUsersController', function($scope,$http,Config) {
  $http.get(Config.host + '/api/admin/users/smappee').then(function(response){
    $scope.smappeeUsers = response.data;
  })

})

.controller('HouseholdsController', function($scope,$http,$uibModal,Config) {
  $http.get(Config.host + '/api/admin/households').then(function(response){
    $scope.households = response.data;
  })
  $http.get(Config.host + '/api/admin/cooperatives').then(function(response){
    $scope.cooperatives = response.data;
  })

  $scope.addMeter = function(household) {
    $uibModal.open({
      templateUrl: "templates/addMeterModal.html",
      controller: 'MeterAddController',
      resolve: {
        item: function() {return household},
        type: function() {return 'households'}
      }
    }).result.then(function(result){
      angular.extend(household,result);
    })
  }

  $scope.removeMeter = function(household, meter){
    $uibModal.open({
      templateUrl: "templates/deleteConfirmationModal.html",
      controller: 'DeleteModalController',
      resolve: {
        message: function() {return 'the meter: ' + meter.meterId}
      }
    }).result.then(function(){
      $http.delete(Config.host + '/api/admin/households/' + household._id + "/meters/" + meter._id).then(function(response){
        angular.extend(household,response.data)
      });
    });
  }

  $scope.previewData = function(household){
    $uibModal.open({
      templateUrl: "templates/previewDataModal.html",
      controller: 'HouseholdDataPreviewController',
      resolve: {
        household: function() {return household}
      }
    })
  }

  $scope.connectHousehold = function(household) {
    var data = {
      connected: !household.connected
    }
    $http.post(Config.host + '/api/admin/households/' + household._id, data).then(function(response){
      angular.extend(household,response.data)
    });
  }

})

.controller('MeterAddController', function($scope, $timeout, $uibModalInstance, $http, Config, item, type){
  $scope.type = 'electricity';
  $http.get("https://app.energimolnet.se/api/2.0/meters?active=true",{
    headers: {
      'Authorization': 'OAuth a4f4e751401477d5e3f1c68805298aef9807c0eae1b31db1009e2ee90c6e'
    }
  }).then(function(response){
    $scope.availableMeters=response.data.data
  })

  $scope.save = function (){
    $scope.error;
    $scope.working = true;
    var meterData = {
      id: $scope.meterId,
      type: 'electricity'
    }
    if( type == 'households') {
      meterData.source = 'energimolnet'
    } else {
      meterData.useInCalc = true
    }
    $http.post(Config.host + '/api/admin/' + type  + '/' + item._id + "/meters", meterData).then(function(response){
      $uibModalInstance.close(response.data);
    },function(response){
      $scope.error = response.data;
    }).finally(function(){
      $scope.working = false;
    })
  }
})

.controller('HouseholdDataPreviewController', function($scope, $timeout, Household, household){
  $scope.household = new Household(household);

  $scope.energyGraphSettings = {
    granularity: "monthly",
    type: "electricity",
    unit: "kWh",
    types: []
  }

  angular.forEach(household.meters, function(meter){
    $scope.energyGraphSettings.types.push({
      name: meter.mType,
      label: meter.mType == 'electricity' ? 'household_electricity' : undefined
    })
  })

  $timeout(function(){
    $scope.$broadcast('civisEnergyGraph.init');
  });

})

.controller('DeleteModalController',function($scope,message){
  $scope.message = message;
})

.controller('CooperativesController', function($scope,$http,$uibModal,Config) {
  $http.get(Config.host + '/api/admin/cooperatives').then(function(response){
    $scope.cooperatives = response.data;
  })

  $scope.addMeter = function(cooperative) {
    $uibModal.open({
      templateUrl: "templates/addMeterModal.html",
      controller: 'MeterAddController',
      resolve: {
        item: function() {return cooperative},
        type: function() {return 'cooperatives'}
      }
    }).result.then(function(result){
      angular.extend(cooperative,result);
    })
  }

  $scope.removeMeter = function(cooperative, meter){
    $uibModal.open({
      templateUrl: "templates/deleteConfirmationModal.html",
      controller: 'DeleteModalController',
      resolve: {
        message: function() {return 'the meter: ' + meter.meterId}
      }
    }).result.then(function(){
      $http.delete(Config.host + '/api/admin/cooperatives/' + cooperative._id + "/meters/" + meter._id).then(function(response){
        angular.extend(cooperative,response.data)
      });
    });
  }

  $scope.addAdmin = function(cooperative) {
    $uibModal.open({
      templateUrl: "templates/addAdminModal.html",
      controller: 'AdminAddController',
      resolve: {
        cooperative: function() {return cooperative}
      }
    }).result.then(function(result){
      angular.extend(cooperative,result);
    })
  }


  $scope.removeAdmin = function(cooperative, editor){
    $http.delete(Config.host + '/api/admin/cooperatives/' + cooperative._id + "/editor/" + editor._id).then(function(response){
      angular.extend(cooperative,response.data)
    });
  }

})

.controller('AdminAddController', function($scope, $timeout, $uibModalInstance, $http, Config, cooperative){
  $http.get(Config.host + '/api/admin/users/').then(function(response){
    $scope.users= _.reject(response.data,function(user){
      return _.findWhere(cooperative.editors,{editorId:user._id});
    });
  })

  $scope.save = function (user){
    $scope.error;
    $scope.working = true;
    var data = {
      editorId:user._id
    }
    $http.post(Config.host + '/api/admin/cooperatives/' + cooperative._id + "/editor", data).then(function(response){
      $uibModalInstance.close(response.data);
    },function(response){
      $scope.error = response.data;
    }).finally(function(){
      $scope.working = false;
    })
  }
})
