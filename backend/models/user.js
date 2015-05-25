'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  token: String,
  profile: {
    name: String,
    dob: Date,
    email: String,
    photo: String
  },
  actions: {
    // NOTE: mixed type schemas below,
    // http://mongoosejs.com/docs/schematypes.html#mixed
    done: {},
    inProgress: {},
    canceled: {}
  },
  energyPlatformID: Number
});
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'userId'
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
