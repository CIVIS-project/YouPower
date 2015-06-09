// Ionic Starter App

endev.autoStart = false;
endev.firebaseProvider = {
  path: "https://youpower.firebaseio.com/"
};


var controllers = angular.module('starter.controllers', []);
var sharedServices = angular.module('starter.sharedServices', []);



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var starter = angular.module('starter', ['ionic', 'ionic.rating', 'Endev', 'starter.controllers', 'starter.sharedServices', 'pascalprecht.translate'])

.run(function($ionicPlatform, $rootScope, $window) {

  $rootScope.scale = 5; 

  $rootScope._=_;

  // Fix for remembaring the user between refresh
  $rootScope.currentUser = $window.localStorage['username'] ? {username: $window.localStorage['username'], lang: "en"} : {};

  $rootScope.$watch("currentUser.username",function(newValue, oldValue){
    if(newValue && oldValue !== newValue) {
      $window.localStorage['username'] = newValue;
    }
  })

  //$rootScope.currentUser = {username:"jmayer@energyup.eu"};

  $rootScope.getNumber = function(num) {
      return new Array(num);   
  }

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
    url: "/welcome",
    templateUrl: "app/welcome/welcome.html",
    controller: 'WelcomeCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "app/tabs/tabs.html",
    controller: 'TabCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.actions', {
    cache: false, 
    url: '/actions',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/tab-actions.html',
        controller: 'ActionsCtrl'
      }
    }
  })

  .state('tab.action', {
    url: '/actions/:id',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/action.html',
        controller: 'ActionCtrl'
      }
    }
  })

  .state('tab.action-details', {
    url: '/actions/:type/:index',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/action-details.html',
        controller: 'ActionsCtrl'
      }
    }
  })

  .state('tab.action-completed', {
    url: '/action-completed/:id',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/action-completed.html',
        controller: 'FormsCtrl'
      }
    }
  })

  .state('tab.action-abandoned', {
    url: '/action-abandoned/:id',
    views: {
      'tab-actions': {
        templateUrl: 'app/actions/action-abandoned.html',
        controller: 'FormsCtrl'
      }
    }
  })

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'app/home/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.community', {
    url: '/community',
    views: {
      'tab-community': {
        templateUrl: 'templates/tab-community.html',
        controller: 'CommunityCtrl'
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

  /*
  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })
*/

.state('tab.settings', {
  url: '/settings',
  views: {
    'tab-settings': {
      templateUrl: 'app/settings/tab-settings.html',
      controller: 'SettingsCtrl'
    }
  }
})

.state('tab.personal', {
  url: '/personal-profile',
  views: {
    'tab-settings': {
      templateUrl: 'app/settings/settingsPersonal.html',
      controller: 'SettingsCtrl'
    }
  }
})

.state('tab.household', {
  url: '/household-profile',
  views: {
    'tab-settings': {
      templateUrl: 'app/settings/settingsHousehold.html'
    }
  }
})


.state('tab.preferences', {
  url: '/preferences',
  views: {
    'tab-settings': {
      templateUrl: 'app/settings/settingsPreferences.html'
    }
  }
})

;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

  for(lang in translations){
    $translateProvider.translations(lang, translations[lang]);
  }
  
  $translateProvider
  .preferredLanguage('en')
  .fallbackLanguage('en');

});







