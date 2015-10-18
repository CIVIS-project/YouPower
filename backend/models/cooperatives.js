'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var escapeStringRegexp = require('escape-string-regexp');

var CooperativeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  lat: Number,
  lng: Number,
  yearOfConst: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true,
  },
  meters: {
    electricity: String,
    heating: String
  },
  actions: [{
    name: String,
    description: String,
    date: Date,
  }],
  editors: [{
    editorId: Schema.Types.ObjectId,
    name: String,
  }]
});

var Cooperative = mongoose.model('Cooperative', CooperativeSchema);

exports.create = function(cooperative, cb) {
  Cooperative.create({
    name: cooperative.name,
    yearOfConst: cooperative.yearOfConst,
    area: cooperative.area
  }, cb);
};

exports.all = function(cb) {
  Cooperative.find({},function(err,cooperatives){
    if (err) {
      cb(err);
    } else {
      cb(null,cooperatives);
    }
  });
}

exports.get = function(id, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative) {
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      cooperative = cooperative.toObject();

      cb(null, cooperative);
    }
  });
};

exports.update = function(id, cooperative, cb) {
  Cooperative.findByIdAndUpdate(id, {
    $set : {
      name: cooperative.name,
      yearOfConst: cooperative.yearOfConst,
      area: cooperative.area
    }
  }, cb);
};

exports.addAction = function(id, action, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative){
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      // cooperative = cooperative.toObject();
      if (!cooperative.actions){
        cooperative.actions = []
      }
      cooperative.actions.push(action);
      cooperative.markModified('actions');
      cooperative.save(function(err){
        cb(err,cooperative);
      })
      // cb(null, cooperative);
    }
  })
}

exports.updateAction = function(id, actionId, newAction, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative){
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      var action = cooperative.actions.id(actionId);
      if(!action) {
        cb('Cooperative action not found');
      } else {
        action.name = newAction.name;
        action.date = newAction.date;
        action.description = newAction.description;
        cooperative.markModified('actions');
        cooperative.save(function(err){
          cb(err,cooperative);
        })
      }
    }
  })
}

exports.deleteAction = function(id, actionId, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative){
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      var action = cooperative.actions.id(actionId);
      if(!action) {
        cb('Cooperative action not found');
      } else {
        action.remove();
        cooperative.markModified('actions');
        cooperative.save(function(err){
          cb(err,cooperative);
        })
      }
    }
  })
}

exports.addEditor = function(id, editor, user, cb) {
    // find the editor name and save it as well, to avoid an extra query when listing editors
    require('../models').users.model.findOne({
        _id:editor.editorId
    }, function(err,user){
        if (err) {
            cb(err);
        } else if (!user) {
            cb('User not found');
        } else {
            editor.name=user.profile.name; 
            Cooperative.findOne({
                _id: id
            }, function(err, cooperative){
                if (err) {
                    cb(err);
                } else if (!cooperative) {
                    cb('Cooperative not found');
                } else {
                    if (!cooperative.editors){
                        cooperative.editors = []
                    }
                    
                    cooperative.editors.push(editor);
                    cooperative.markModified('editors');
                    cooperative.save(function(err){
                        cb(err,cooperative);
                    })
                }
            })
        }
    })    
}


exports.deleteEditor = function(id, coopEditorId, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative){
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      var editor = cooperative.editors.id(coopEditorId);
      if(!editor) {
        cb('Cooperative editor not found');
      } else {
        editor.remove();
        cooperative.markModified('editors');
        cooperative.save(function(err){
          cb(err,cooperative);
        })
      }
    }
  })
}


exports.model = Cooperative;
