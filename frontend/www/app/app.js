// Ionic Starter App


var controllers = angular.module('starter.controllers', []);
var services = angular.module('starter.services', []);


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var starter = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'pascalprecht.translate'])

.run(function($ionicPlatform) {
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
    templateUrl: "templates/welcome.html",
    controller: 'WelcomeCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "app/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.actions', {
    url: '/actions',
    views: {
      'tab-actions': {
        templateUrl: 'templates/tab-actions.html',
        controller: 'ActionsCtrl'
      }
    }
  })

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
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

  .state('tab.performance', {
    url: '/performance',
    views: {
      'tab-performance': {
        templateUrl: 'templates/tab-performance.html',
        controller: 'PerformanceCtrl'
      }
    }
  })

  .state('tab.challenges', {
    url: '/challenges',
    views: {
      'tab-challenges': {
        templateUrl: 'templates/tab-challenges.html',
        controller: 'ChallengesCtrl'
      }
    }
  })

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







