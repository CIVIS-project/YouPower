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
    cost: Number,
    types: [Number],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        // required: true, // TODO: causes strange error
        ref: 'User'
      },
      comment: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  ventilationType: String,
  performance: Number,
  editors: [{
      editorId: Schema.Types.ObjectId,
      name: String,
  }],
});

var Cooperative = mongoose.model('Cooperative', CooperativeSchema);

exports.create = function(cooperative, cb) {
  Cooperative.create({
    name: cooperative.name,
    yearOfConst: cooperative.yearOfConst,
    area: cooperative.area,
    ventilationType: cooperative.ventilationType
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
  })
  .populate('actions.comments.user','profile _id')
  .exec(function(err, cooperative) {
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      cooperative = cooperative.toObject();
      _.each(cooperative.actions,function(action){
        action.commentsCount = action.comments.length;
        action.comments = _.chain(action.comments)
        .sortBy(function(comment){
          return comment.date;
        })
        .reverse()
        .first(2);
      });
      cb(null, cooperative);
    }
  });
};

exports.update = function(id, cooperative, cb) {
  Cooperative.findByIdAndUpdate(id, {
    $set : {
      name: cooperative.name,
      yearOfConst: cooperative.yearOfConst,
      area: cooperative.area,
      ventilationType: cooperative.ventilationType
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
        action.cost = newAction.cost;
        action.types = newAction.types;
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

exports.commentAction = function(id, actionId, comment, user, cb) {
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
        if(!action.comments){
          action.comments = [];
        }
        comment.user = user._id;
        action.comments.push(comment);
        comment = _.last(action.comments).toObject();
        cooperative.markModified('actions');
        cooperative.save(function(err,cooperative){
          comment.user = {
            _id: user._id,
            profile: user.profile
          };
          cb(err,comment);
        })
      }
    }
  })
}

exports.getMoreComments = function(id, actionId, lastCommentId, user, cb) {
  Cooperative.findOne({
    _id: id
  })
  .populate('actions.comments.user','profile')
  .exec(function(err, cooperative) {
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      var action = cooperative.actions.id(actionId);
      if(!action) {
        cb('Cooperative action not found');
      } else {
        action = action.toObject();
        action.comments = _.chain(action.comments)
        .sortBy(function(comment){
          return comment.date;
        })
        .reverse()
        .value();
        console.log(action.comments);
        var currentLastIndex = _.findIndex(action.comments,function(comment){
          return comment._id == lastCommentId;
        });
        console.log(currentLastIndex);
        cb(null, _.last(action.comments,action.comments.length - currentLastIndex - 1));
      }
    }
  });
}

exports.deleteActionComment = function(id, actionId, commentId, user, cb) {
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
        var comment = action.comments.id(commentId);
        if(!comment) {
          cb('Comment not found');
        }
        comment.remove();
        cooperative.markModified('actions');
        cooperative.save(function(err){
          cb(err);
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
