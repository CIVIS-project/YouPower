'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  token: String,
  facebookId: String,
  profile: {
    name: String,
    dob: Date,
    photo: String
  },
  actions: {
    // NOTE: mixed type schemas below,
    // http://mongoosejs.com/docs/schematypes.html#mixed
    done: {
      type: Object,
      default: {}
    },
    inProgress: {
      type: Object,
      default: {}
    },
    canceled: {
      type: Object,
      default: {}
    }
  },
  energyPlatformID: Number
});
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
