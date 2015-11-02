angular.module('civis.youpower')

.factory('Cooperatives', function($resource, $http, Config) {
  var result = $resource(Config.host + '/api/cooperative/:id', {id:'@_id'},{
    update: {
      method: 'PUT'
    },
    addAction: {
      method: 'POST',
      url: Config.host + '/api/cooperative/:id/action'
    },
    updateAction: {
      method: 'PUT',
      url: Config.host + '/api/cooperative/:id/action/:actionId'
    },
    deleteAction: {
      method: 'DELETE',
      url: Config.host + '/api/cooperative/:id/action/:actionId'
    },
    commentAction: {
      method: 'POST',
      url: Config.host + '/api/cooperative/:id/action/:actionId/comment'
    },
    getMoreComments: {
      method: 'GET',
      isArray: true,
      url: Config.host + '/api/cooperative/:id/action/:actionId/comment'
    },
    deleteActionComment: {
      method: 'DELETE',
      url: Config.host + '/api/cooperative/:id/action/:actionId/comment/:commentId'
    }
  });

  result.prototype.getEnergyData = function(type, granularity, period){
    return $http.get(Config.host + '/api/cooperative/' + this._id + '/consumption/' +
      type + "/" +
      granularity + "?from=" +
      period,{
        cached:true,
      })
  };

  result.prototype.getAvgEnergyData = function(type, granularity, period) {
    return $http.get(Config.host + '/api/cooperative/consumption/' +
      type + "/" +
      granularity + "?from=" +
      period,{
        cached:true,
      })
  };

  result.VentilationTypes = ["FTX (mekanisk från- och tilluft med återvinning)","FVP (frånluftsvärmepump)","F (mekanisk frånluftsventilation)","FT (mekanisk från- och tilluftsventilation)","S (självdragsventilation)","Vet ej","Övrig"]

  result.getActionTypes = function(){
    var actions = [{
      id: 100,
    },{
      id: 101,
      parent: 100
    },{
      id: 102,
      parent: 100
    },{
      id: 103,
      parent: 100
    },{
      id: 104,
      parent: 100
    },{
      id: 105,
      parent: 100
    },{
      id: 106,
      parent: 100
    },{
      id: 200,
    },{
      id: 201,
      parent: 200
    },{
      id: 202,
      parent: 200
    },{
      id: 203,
      parent: 200
    },{
      id: 204,
      parent: 200
    },{
      id: 205,
      parent: 200
    },{
      id: 206,
      parent: 200
    }];
    actions.getById = function(id) {
      return _.findWhere(this,{id:id});
    }
    return actions;
  };

  return result;
});
