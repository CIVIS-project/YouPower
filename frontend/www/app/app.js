// CIVIS YouPower App

angular.module('civis.youpower.actions',[]);
angular.module('civis.youpower.communities',[]);
angular.module('civis.youpower.settings',[]);
angular.module('civis.youpower.welcome',[]);
angular.module('civis.youpower.prosumption',['highcharts-ng']);
angular.module('civis.youpower.donation',[]);

angular.module('civis.youpower', [
  'ionic',
  'ionic.rating',
  'ngResource',
  'ngSanitize',
  'pascalprecht.translate',
  'civis.youpower.main',
  'civis.youpower.actions',
  'civis.youpower.communities',
  'civis.youpower.cooperatives',
  'civis.youpower.households',
  'civis.youpower.settings',
  'civis.youpower.welcome',
  'civis.youpower.translations',
  'civis.youpower.prosumption',
  'civis.youpower.donation',
  ])

.run(function($ionicPlatform, $rootScope, $window, $state, AuthService) {

  $rootScope.scale = 5;
  var z = [];
  $rootScope.chartConfigComparisonHistorical = [];
  $rootScope.applicanceDataStore = [];
  $rootScope.chartConfigAppliance2 = [];
  $rootScope.energyWeatherDataVector=[];
  $rootScope.chartConfigLastProduction = [];
  $rootScope.chartConfigLastConsumption = [];

  /**
      used the global scope to store the value from the web service
      should be changed with services in later release
  */
 
  $rootScope.chartConfigComparisonHistorical = [];
  $rootScope.applicanceDataStore = [];
  $rootScope.chartConfigAppliance2 = [];
  $rootScope.energyWeatherDataVector=[];
  $rootScope.chartConfigLastProduction = [];
  $rootScope.chartConfigLastConsumption = [];


  // Making underscore available in the angular expressions
  $rootScope._=_;

  $rootScope.getNumber = function(num) {
    return new Array(num);
  }

  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

    // console.log("stateChangeStart: 1." + fromState.name + " 2." + next.name + " isAuthenticated: "+AuthService.isAuthenticated());

   if (!AuthService.isAuthenticated()) {

      if (next.name.indexOf('main') == 0){
          event.preventDefault();
          $state.go('welcome');
      }
    }
  });

  $rootScope.$on('$stateChangeError', function(event, next, nextParams, fromState, fromParams, error) {
      console.error("State Change error occurred!");
      console.error(arguments);
      // console.log("stateChangeError: 1." + fromState.name + " 2." + next.name);
      if (next.name !== 'welcome' && next.name !== 'signup'){
          event.preventDefault();
          $state.go('welcome');
      }
  });


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  }
  if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
      if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#249143");
      }
    }
  });
})


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('welcome', {
    url: "/welcome/:token",
    templateUrl: "app/welcome/welcome.html",
    controller: 'WelcomeCtrl'
  })

  .state('signup', {
    url: "/signup?tid&cid",
    templateUrl: "app/welcome/signup.html",
    controller: 'SignupCtrl',
    resolve: {
      Testbed: 'Testbed',
      Cooperative: 'Cooperatives',
      testbed: function(Testbed,$stateParams,$q){
        if($stateParams.tid){
          // Wrapping in promise so it breaks silently
          return $q(function(resolve){
            Testbed.get({id:$stateParams.tid},function(data){
              resolve(data);
            },function(){resolve()})
          });
        }else {
          return null;
        }
      },
      cooperative: function(Cooperative,$stateParams,$q){
        if($stateParams.cid){
          // Wrapping in promise so it breaks silently
          return $q(function(resolve){
            Cooperative.get({id:$stateParams.cid},function(data){
              resolve(data);
            },function(){resolve()})
          });
        }else {
          return null;
        }
      }
    }
  })


  .state('passwordRecovery',{
    url: "/recover",
    templateUrl: "app/welcome/recover.html",
    controller: 'PasswordRecoveryCtrl',
  })

  .state('passwordRecoverySent',{
    url: "/recover/sent",
    templateUrl: "app/welcome/sent.html",
  })

  .state('resetPassword', {
    url: "/recover/:token",
    templateUrl: "app/welcome/reset.html",
    controller: 'PasswordRecoveryCtrl',
  })

  // setup an abstract state that will contain the main navigation (i.e. menu)
  .state('main', {
    url: "/app",
    abstract: true,
    templateUrl: "app/app/menu.html",
    controller: 'AppCtrl',
    resolve: {
      User: 'User',     
      Testbed: 'Testbed',
      Cooperatives: 'Cooperatives',
      currentUser: function(User,Testbed,Cooperatives){
        var userPromise = User.get().$promise;
        userPromise.then(function(user){
          if(user.testbed) {
            user.testbed = new Testbed(user.testbed);
          }
          if(user.cooperative) {
            user.cooperative = new Cooperatives(user.cooperative);
          }
          mixpanel.identify(user._id);
          mixpanel.people.set({
              "$name": user.profile.name,
              "$created": new Date(parseInt(user._id.toString().slice(0,8), 16)*1000),
              "$email": user.email,
              "Testbed": (user.testbed || {}).name,
              'Cooperative': (user.cooperative || {}).name,
          });
        });
        return userPromise;
      }
    }
  })

  .state('main.actions', {
    url: '/actions',
    abstract:true,
    views: {
      'menuContent': {
        templateUrl: 'app/actions/tabs.html',
        controller: 'ActionsCtrl',
        resolve: {
          pendingInvites: function(User){
            return User.getPendingInvites().$promise;
          }
        }
      }
    }
  })


  .state('main.actions.yours', {
    url: '/yours',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/index.html',
        controller: 'ActionCtrl'
      }
    }
  })


  .state('main.actions.action', {
    url: '/suggested/:id',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/action.html',
        controller: 'ActionCtrl'
      }
    }
  })

.state('main.actions.details', {
  url: '/:type/:index',
  views: {
    'tab-actions': {
      templateUrl: 'app/actions/action-details.html',
      controller: 'ActionsListCtrl'
    }
  }
})



.state('main.actions.completed', {
  url: '/:id/completed',
  views: {
    'tab-actions': {
      templateUrl: 'app/actions/action-completed.html',
      controller: 'FormsCtrl'
    }
  }
})

.state('main.actions.abandoned', {
  url: '/:id/abandoned',
  views: {
    'tab-actions': {
      templateUrl: 'app/actions/action-abandoned.html',
      controller: 'FormsCtrl'
    }
  }
})


.state('main.actions.household', {
  url: '/household',
  views: {
    'tab-household': {
      templateUrl: 'app/household/index.html',
      controller: 'HouseholdCtrl'
    }
  }
})

.state('main.actions.addmember', {
  url: '/household/members/add',
  views: {
    'tab-household': {
      templateUrl: 'app/household/addmember.html',
      controller: 'MemberCtrl'
    }
  }
})

.state('main.actions.communities', {
  url: '/communities',
  views: {
    'tab-communities': {
      templateUrl: 'app/communities/index.html',
    }
  }
})

.state('main.actions.achievements', {
  url: '/achievements',
  views: {
    'tab-achievements': {
      templateUrl: 'app/achievements/index.html',
    }
  }
})

// Dontation states
//commented out due to lack of clarity
// .state('main.donation', {
//   url: '/donation',
//   views: {
//     'menuContent': {
//       templateUrl: 'app/donation/index.html',
//       controller: 'donationCtrl'
//     }
//   }
// })


/* Prosumption states */

.state('main.prosumption', {
  url: '/prosumption',
  views: {
    'menuContent': {
      templateUrl: 'app/prosumption/tabs.html',
          controller: 'prosumptionCtrl'
        }
      }
    })

  .state('main.prosumption.yours', {
    url: '/yours',
    views: {
      'tab-prosumption-yours': {
        templateUrl: 'app/prosumption/index_yours.html',
       controller: 'dataVizCtrl'
      }
    }
  })
.state('main.prosumption.appliances', {
    url: '/appliances',
    views: {
      'tab-prosumption-appliances': {
        templateUrl: 'app/prosumption/index_appliances.html',
       controller: 'dataVizCtrl'
      }
    }
  })

.state('main.prosumption.community', {
    url: '/community',
    views: {
      'tab-prosumption-community': {
        templateUrl: 'app/prosumption/index_community.html',
       controller: 'dataVizCtrl'
      }
    }
  })
.state('main.prosumption.vizEnergyMeteo', {
  url: '/vizEnergyMeteo',
  views: {
    'tab-prosumption-yours': {
      templateUrl: 'app/prosumption/viz_energy_meteo.html',
      controller: 'dataVizCtrl',
    }
  }
}
)
.state('main.prosumption.vizConsumption', {
  url: '/viz',
  views: {
    'tab-prosumption-yours': {
    templateUrl: 'app/prosumption/viz_consumption_yours.html',
    controller: 'dataVizCtrl' ,
    }
  }
})
.state('main.prosumption.vizProduction', {
  url: '/viz2',
  views: {
    'tab-prosumption-yours': {
    templateUrl: 'app/prosumption/viz_production_yours.html',
    controller: 'dataVizCtrl' ,
    }
  }
})
.state('main.prosumption.vizHistoricalPersonal', {
  url: '/vizHistoricalPersonal',
  views: {
    'tab-prosumption-yours': {
      templateUrl: 'app/prosumption/viz_historical_personal.html',
      controller: 'dataVizCtrl',
    }
  }
}
)
.state('main.prosumption.vizHistoricalComparison', {
  url: '/vizHistoricalComparison',
  views: {
    'tab-prosumption-yours' : {
      templateUrl: 'app/prosumption/viz_historical_comparison.html',
      controller: 'dataVizCtrl',
    }
  }
}
)
.state('main.prosumption.vizAppliance', {
    url: '/vizAppliance',
    views: {
      'tab-prosumption-appliances': {
        templateUrl: 'app/prosumption/viz_appliance.html',
       controller: 'dataVizCtrl'
      }
    }
  })

/* Cooperative states */

.state('main.cooperative', {
  url: '/cooperatives',
  abstract: true,
  views: {
    'menuContent': {
      templateUrl: 'app/cooperative/tabs.html'
    }
  }
})

.state('main.cooperative.my',{
  url: '/my',
  cached: false,
  views: {
    'tab-my': {
      templateUrl: 'app/cooperative/show.html',
      controller: 'CooperativeCtrl'
    }
  }
})

.state('main.cooperative.list',{
  url: '/list',
  cached: false,
  views: {
    'tab-list': {
      templateUrl: 'app/cooperative/index.html',
      controller: 'CooperativesCtrl'
    }
  },
  resolve: {
    Cooperatives: 'Cooperatives',
    cooperatives: function(Cooperatives){
      return Cooperatives.query().$promise;
    }
  }
})

.state('main.cooperative.show',{
  url: '/:id',
  views: {
    'tab-my': {
      templateUrl: 'app/cooperative/show.html',
      controller: 'CooperativeCtrl'
    }
  }
})

.state('main.cooperative.my.edit', {
  url: '/edit',
  views: {
    'tab-my@main.cooperative': {
      templateUrl: 'app/cooperative/edit.html',
      controller: 'CooperativeEditCtrl'
    }
  }
})

.state('main.cooperative.my.edit.actionAdd', {
  url: '/action',
  views: {
    'tab-my@main.cooperative': {
      templateUrl: 'app/cooperative/editAction.html',
      controller: 'CooperativeActionAddCtrl'
    }
  }
})

.state('main.cooperative.my.edit.actionUpdate', {
  url: '/action/:id',
  views: {
    'tab-my@main.cooperative': {
      templateUrl: 'app/cooperative/editAction.html',
      controller: 'CooperativeActionUpdateCtrl'
    }
  }
})

/* Household states */

.state('main.household', {
  url: '/household',
  views: {
    'menuContent': {
      templateUrl: 'app/household/energy.html',
      controller: 'HouseholdEnergyCtrl'
    }
  }
})

.state('main.communities', {
  url: '/communities',
  views: {
    'menuContent': {
      templateUrl: 'app/communities/index.html',
      controller: 'CommunitiesCtrl'
    }
  }
})

.state('main.settings', {
  url: '/settings',
  abstract: true,
  views: {
    'menuContent': {
      templateUrl: 'app/settings/tabs.html',
      controller: 'SettingsCtrl'
    }
  }
})

.state('main.settings.index', {
  url: '/main/:res',
  views: {
    'tab-index': {
      templateUrl: 'app/settings/index.html',
      controller: 'PersonalSettingsCtrl'
    }
  }
})

.state('main.settings.personal', {
  url: '/personal',
  views: {
    'tab-personal': {
      templateUrl: 'app/settings/personal.html',
      controller: 'PersonalSettingsCtrl'
    }
  }
})

.state('main.settings.household', {
  url: '/household',
  views: {
    'tab-household': {
      templateUrl: 'app/settings/household.html',
      controller: 'HouseholdSettingsCtrl',
      resolve: {
        currentHousehold: function(Household, currentUser){
          if (currentUser.householdId) {
            return Household.get({id: currentUser.householdId}).$promise;
          }else{return null;}

        }
      }
    }
  }
})

.state('main.about', {
  url: '/about',
  views: {
    'menuContent': {
      templateUrl: 'app/about/index.html',
    }
  }
})

  // .state('tab.performance', {
  //   url: '/performance',
  //   views: {
  //     'tab-performance': {
  //       templateUrl: 'templates/tab-performance.html',
  //       controller: 'PerformanceCtrl'
  //     }
  //   }
  // })

  // .state('tab.challenges', {
  //   url: '/challenges',
  //   views: {
  //     'tab-challenges': {
  //       templateUrl: 'templates/tab-challenges.html',
  //       controller: 'ChallengesCtrl'
  //     }
  //   }
  // })

;
  //$urlRouterProvider.otherwise('/app/actions/yours');
  $urlRouterProvider.otherwise('/welcome/');

});





