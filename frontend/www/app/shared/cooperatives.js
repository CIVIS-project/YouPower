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

  result.prototype.getStringId = function() {
    return this.name.toUpperCase().replace(/ /g,'');
  };

  result.prototype.getEnergyData = function(type, granularity, period){
    return $http.get(Config.host + '/api/cooperative/' + this._id + '/consumption/' +
      type + "/" +
      granularity + "?from=" +
      period,{
        cached:true,
      })
  };

  result.prototype.getEnergyDataFromCooperative = function(type, granularity, period, id){
    return $http.get(Config.host + '/api/cooperative/' + id + '/consumption/' +
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

  var energyClassReqValue = 70;

  result.prototype.getEnergyClass = function() {
    if(this.performance <= energyClassReqValue * 0.5) {
      return 'A';
    } else if(this.performance > energyClassReqValue * 0.5 && this.performance <= energyClassReqValue * 0.75) {
      return 'B';
    } else if(this.performance > energyClassReqValue * 0.75 && this.performance <= energyClassReqValue * 1.0) {
      return 'C';
    } else if(this.performance > energyClassReqValue * 1.0 && this.performance <= energyClassReqValue * 1.35) {
      return 'D';
    } else if(this.performance > energyClassReqValue * 1.35 && this.performance <= energyClassReqValue * 1.8) {
      return 'E';
    } else if(this.performance > energyClassReqValue * 1.8 && this.performance <= energyClassReqValue * 2.35) {
      return 'F';
    } else if(this.performance > energyClassReqValue * 2.35) {
      return 'G';
    } else {
      return 'unknown';
    }
  }

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
    },{
      id: 300,
    },{
      id: 301,
      parent: 300
    },{
      id: 302,
      parent: 300
    }];
    actions.getById = function(id) {
      return _.findWhere(this,{id:id});
    }
    return actions;
  };

  return result;
});
