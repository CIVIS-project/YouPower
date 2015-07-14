'use strict';

angular.module('civis.youpower')

.service('AuthService', function($q, $http, $window, $timeout, Base64, $firebaseObject) {
  var LOCAL_TOKEN_KEY = 'CIVIS_TOKEN';
  var isAuthenticated = false;

  function loadUserCredentials() {
    var token = $window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    $window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;

    // Set the token as header for your requests!
    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  function destroyUserCredentials() {
    isAuthenticated = false;
    $http.defaults.headers.common['Authorization'] = undefined;
    $window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(username, password) {
    return $q(function(resolve, reject) {
      /* Dummy authentication for old Firebase data
       ----------------------------------------------*/
      var ref = new Firebase('https://youpower.firebaseio.com/users');
      $firebaseObject(ref).$loaded().then(function(data){
        var userid = _.findKey(data,function(user){return user && user.username == username});
        if (userid) {
          storeUserCredentials(userid);
          resolve('Login success.');
        } else {
          reject('Login Failed.');
        }
      })

      /* Use this for real authentication
       ----------------------------------------------*/
      // var headers = {
      //   'Authorization':'Basic ' + Base64.encode(username + ':' + password)
      // }

      // $http.get('/api/user/token', {headers:headers})
      //  .success(function (data) {
      //   storeUserCredentials(data.token);
      //   resolve('Login success.');
      //  })
      //  .error(function(data){
      //   reject('Login failed');
      //  });

    });

  };

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
    getToken: function() {return $window.localStorage.getItem(LOCAL_TOKEN_KEY);}
  };
})

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});
