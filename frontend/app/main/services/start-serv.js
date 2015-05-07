'use strict';
angular.module('main')
.service('Start', function () {
  console.log('Hello from your Service: Start in module main');

  // some initial data
  this.someData = {
    binding: 'Yes! Got that databinding working'
  };

  // TODO: do your service thing
});
