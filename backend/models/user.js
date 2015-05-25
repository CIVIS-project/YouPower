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
  energyPlatformID: Number
});
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'userId'
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
