'use strict';

var mongoose = require('mongoose');
var Action = require('./actions');
//var Community = require('./communities');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var nodemailer = require('nodemailer'); 
var escapeStringRegexp = require('escape-string-regexp');
var achievements = require('../common/achievements');
var actionComments = require('./actionComments');
var communityComments = require('./communityComments');
var households = require('./households');
var async = require('async');
var _ = require('underscore');

var UserSchema = new Schema({
  token: String,
  facebookId: String,
  accessToken: String,
  profile: {
    name: String,
    nickname: String,
    gender: String,
    // gender: {
    //   type: String,
    //   enum: 'Male Female'.split(' ')
    // },
    dob: Date,
    photo: String,
    language: {
      type: String,
      default: 'English'
    },
    toRehearse: {
      setByUser: {
        type: Boolean, 
        default: false 
      },
      declined: Boolean, 
      done: Boolean, 
      na: Boolean
    }
  },
  // contains state of each achievement
  achievements: {
    type: Object,
    default: {}
  },
  // contains three most recent achievements
  recentAchievements: {
    type: Object,
    default: {}
  },
  actions: {
    // NOTE: mixed type schemas below,
    // http://mongoosejs.com/docs/schematypes.html#mixed

    // user has postponed action
    pending: {
      type: Object,
      default: {}
    },

    // user is performing action
    inProgress: {
      type: Schema.Types.Mixed,
      default: {}
    },

    // user is done performing action
    done: {
      type: Object,
      default: {}
    },

    // user has declined an action or canceled an action that they were already performing
    declined: {
      type: Object,
      default: {}
    },

    // user has specified that the action is not applicable to them
    na: {
      type: Object,
      default: {}
    }
  },
  numFeedback: {
    type: Number,
    default: 0
  },
  // how many PVs does the user have that can produce energy?
  production: {
    type: Number,
    default: 0
  }
});
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  // do fewer pbkdf2 hashing iterations when unit testing for performance reasons
  iterations: process.env.NODE_ENV === 'test' ? 1 : /* istanbul ignore next */ 25000
});

var User = mongoose.model('User', UserSchema);

exports.authenticate = User.authenticate;
exports.serializeUser = User.serializeUser;
exports.deserializeUser = User.deserializeUser;

exports.register = function(userInfo, password, cb) {
  User.register(new User(userInfo), password, cb);
};
exports.create = function(userInfo, cb) { // alias for unit tests
  exports.register(userInfo, userInfo.password, cb);
};
exports.getProfile = function(id, cb) {
  User.findOne({_id: id}, false, function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    var totalLeaves = 0;

    _.each(user.actions.done, function(action) {
      // leaves for actions: impact + effort
      totalLeaves += (action.impact + action.effort)*(action.alreadyDoingDate.length + action.doneDate.length);
    });

    // leaves for feedback: 1 leaf / feedback
    totalLeaves += user.numFeedback;

    var householdId = null;
    var pendingHouseholdInvites = [];
    var pendingCommunityInvites = ['TODO'];

    async.parallel([
      function(cb) {
        // find households user has been invited to
        households.findInvites(user._id, function(err, households) {
          if (err) {
            return cb(err);
          }

          pendingHouseholdInvites = households;

          cb();
        });
      },
      function(cb) {
        // find which household user is in
        households.getByUserId(user._id, function(err, household) {
          if (err) {
            return cb(err);
          }

          if (household) {
            householdId = household._id;
          }

          cb();
        });
      },
      function(cb) {
        // action comment count needed for leaf count
        actionComments.getByUser(user, null, null, function(err, aComments) {
          if (err) {
            return cb(err);
          }
          // leaves for action comments: 1 leaf / comment
          totalLeaves += aComments.length;
          cb();
        });
      },
      function(cb) {
        // community comment count needed for leaf count
        communityComments.getByUser(user, null, null, function(err, cComments) {
          if (err) {
            return cb(err);
          }
          // leaves for community comments: 1 leaf / comment
          totalLeaves += cComments.length;
          cb();
        });
      }
    ], function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, {
        _id: id,
        email: user.email,
        profile: user.profile,
        actions: user.actions,
        accessToken: user.accessToken,
        facebookId: user.facebookId,
        production: user.production,
        householdId: householdId,
        pendingHouseholdInvites: pendingHouseholdInvites,
        pendingCommunityInvites: pendingCommunityInvites,
        leaves: totalLeaves,
        energyConsumption: {} // TODO
      });
    });
  });
};

// //Display user's communities (member of which community?)
// exports.getUserCommunities = function(id, cb) {
//   User.findOne({_id: id}, function(err, user) {
//     /* istanbul ignore if: db errors are hard to unit test */
//     if (err) {
//       return cb(err);
//     }
//     console.log(user._id);
//     Community.model
//     .find({members: {$in : user._id}})
//     .exec(function(err, communities) {
//       if (err) {
//         return cb(err);
//       }
//       if (!communities) {
//         return cb('Community not found');
//       } else {
//         console.log(communities);
//         // convert every returned action into a raw object (remove mongoose magic)
//         for (var i = 0; i < communities.length; i++) {
//           communities[i] = communities[i].toObject();
//         }
//         cb(null, communities);
//       }
//     });
//   });
// };

//Display user's actions
//Display user's actions based on 'type' passed.
//May be there is better way to do this?
exports.getUserActions = function(id, type, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
      switch (type)
      {
        case 'progress':
          return cb(null, user.actions.inProgress);
        case 'pending':
          return cb(null, user.actions.pending);
        case 'done':
          return cb(null, user.actions.done);
        case 'declined':
          return cb(null, user.actions.declined);
        case 'na':
          return cb(null, user.actions.na);
        default:
          return cb(null, user.actions);
      }
    }
  });
};

/*exports.getUserChallenges = function(id, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
        return cb(null, user.actions);
      }
    }
  });
};*/

exports.find = function(q, multi, limit, skip, cb) {

  //console.log("q:" + JSON.stringify(q,null,4));

  var aQ = JSON.parse(JSON.stringify(q));

  for(var key in aQ) {
    if(aQ.hasOwnProperty(key)) {

      if(key === 'name') {
        aQ['profile.name'] = aQ['name'];
        delete aQ['name'];
      }else if(key === 'userId') {
        aQ['_id'] = aQ['userId'];
        delete aQ['userId'];
      }
    }
  }

  // pick any key that is present from the list [_id, profile.name, email]
  var keys = _.keys(aQ);
  var key = _.first(_.intersection(keys, ['_id', 'profile.name', 'email']));

  // if searching by _id require exact match, otherwise do a regexp search
  var filteredQ = {};
  filteredQ[key] = key === '_id' ? aQ[key].toString() :
    new RegExp('^' + escapeStringRegexp(String(aQ[key])) + '|' + escapeStringRegexp(String(aQ[key])) + '$', 'i'); 

  var query = User.find(filteredQ);
  query.select('email profile actions achievements recentAchievements');
  query.limit(limit);
  query.skip(skip);
  query.exec(function(err, res) {
    // return array if multi is true, otherwise return first element
    cb(err, multi ? res : res[0]);
  });
};

// NOTE: the rest of these functions go against the convention of taking in a
// model id instead of the model itself. Reason for this is that
// passport-local-mongoose gives us the user model after each a successful
// authentication, and it would be wasteful to fetch it again here

exports.updateProfile = function(user, profile, cb) { 

  //console.log("profile: "+JSON.stringify(profile, null, 4));
  //console.log("user.profile1: "+JSON.stringify(user.profile, null, 4));


  // update any fields that are defined
  // not sure about this: need to see how to do this automatically 
  if (profile.name !== undefined) 
    user.profile.name = profile.name; 
  if (user.profile.name === null) 
    user.profile.name = undefined; 
  if (profile.nickname !== undefined)
    user.profile.nickname = profile.nickname;
  if (user.profile.nickname === null) 
    user.profile.nickname = undefined; 
  if (profile.gender !== undefined)
    user.profile.gender = profile.gender;
  if (user.profile.gender === null)  
    user.profile.gender = undefined; 
  if (profile.dob !== undefined)
    user.profile.dob = profile.dob;
  if (user.profile.dob === null) 
    user.profile.dob = undefined; 
  if (profile.photo !== undefined)
    user.profile.photo = profile.photo;
  if (user.profile.photo === null) 
    user.profile.photo = undefined; 
  if (profile.language !== undefined)
    user.profile.language = profile.language;
  if (user.profile.language === null) 
    user.profile.language  = undefined; 
  if (profile.toRehearse !== undefined)
    user.profile.toRehearse = profile.toRehearse;
  if (user.profile.toRehearse === null) 
    user.profile.toRehearse = undefined;  

  //console.log("user.profile2: "+JSON.stringify(user.profile, null, 4));

  user.markModified('profile');
  // user.markModified('profile.name');
  // user.markModified('profile.nickname');
  // user.markModified('profile.gender');
  // user.markModified('profile.dob');
  // user.markModified('profile.photo');
  // user.markModified('profile.language');
  // user.markModified('profile.toRehearse');

  user.save(function(err) {
    cb(err, user.profile);
  });
};

exports.mailHouseholdMember = function(user, mail, cb) { 

  var title = 'Hello world from ' + user.profile.name + ' to ' + mail.name + '</br>';

  var source = '<!DOCTYPE html><html><head> <meta charset="UTF-8" content="width=device-width" http-equiv="Content-Type" name="viewport"> <title>Sign Up for YouPower</title></head><body style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;background-color: #DEE0E2;height: 100% !important;width: 100% !important;"> <table align="center" border="0" cellpadding="0" cellspacing="0" id="bodyTable" width="100%" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 0;background-color: #DEE0E2;border-collapse: collapse !important;height: 100% !important;width: 100% !important;"> <tr> <td align="center" id="bodyCell" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 20px;border-top: 4px solid #BBBBBB;height: 100% !important;width: 100% !important;"> <table border="0" cellpadding="0" cellspacing="0" id="templateContainer" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;width: 600px;border: 1px solid #BBBBBB;border-collapse: collapse !important;"> <tr> <td align="center" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"> <!-- BEGIN PREHEADER // --> <table border="0" cellpadding="0" cellspacing="0" id="templatePreheader" width="100%" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F4F4F4;border-bottom: 1px solid #CCCCCC;border-collapse: collapse !important;"> <tr> <td class="preheaderContent" style="padding-top: 10px;padding-right: 20px;padding-bottom: 10px;padding-left: 20px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #808080;font-family: Helvetica;font-size: 10px;line-height: 125%;text-align: left;" valign="top">Discover <b>YouPower</b>, a new social app for energy.</td></tr> </table><!-- // END PREHEADER --> </td> </tr> <tr> <td align="center" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"> <!-- BEGIN HEADER // --> <table border="0" cellpadding="0" cellspacing="0" id="templateHeader" width="100%" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F4F4F4;border-top: 1px solid #FFFFFF;border-bottom: 1px solid #CCCCCC;border-collapse: collapse !important;"> <tr> <td class="headerContent" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #505050;font-family: Helvetica;font-size: 20px;font-weight: bold;line-height: 100%;padding-top: 0;padding-right: 0;padding-bottom: 0;padding-left: 0;text-align: left;vertical-align: middle;"> <img id="headerImage" src="http://www.public-domain-image.com/free-images/nature-landscapes/rain/raindrops-on-nasturtium-leaf.jpg" style="max-width: 600px;-ms-interpolation-mode: bicubic;border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;"></td> </tr> </table><!-- // END HEADER --> </td> </tr> <tr> <td align="center" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"> <!-- BEGIN BODY // --> <table border="0" cellpadding="0" cellspacing="0" id="templateBody" width="100%" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F4F4F4;border-top: 1px solid #FFFFFF;border-bottom: 1px solid #CCCCCC;border-collapse: collapse !important;"> <tr> <td class="bodyContent" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #505050;font-family: Helvetica;font-size: 14px;line-height: 150%;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;"> <h1 style="display: block;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;color: #202020 !important;">Invitation from ' + user.profile.name + ' to join YouPower</h1> <p style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">Hi there,</p> <p style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">Your friend ' + user.profile.name + ' thinks that you would like to use YouPower. YouPower is a free <b>social app for energy</b> and it is simple and fun to use.</p><br> <h1 style="text-align: center;display: block;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;color: #202020 !important;"> <a class="button" href="https://app.civisproject.eu/frontend.html" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;color: #EB4102;font-weight: normal;text-decoration: underline;">Join YouPower</a></h1><br> <p style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">With YouPower you can find answers to your questions about different energy practices and save energy together with your family, friends or neighbors. Sign up to disover more.</p> </td> </tr> <tr> <td style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"> <table border="0" cellpadding="0" cellspacing="0" id="templateFooter" width="100%" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F4F4F4;border-top: 1px solid #FFFFFF;border-collapse: collapse !important;"> <tr> <td class="footerContent" valign="top" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #808080;font-family: Helvetica;font-size: 10px;line-height: 150%;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;"> <a href="https://www.facebook.com/CIVISproject" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;color: #606060;font-weight: normal;text-decoration: underline;"> Find out more on our Facebook page</a>&nbsp; </td> </tr> <tr> <td class="footerContent" style="padding-top: 20px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #808080;font-family: Helvetica;font-size: 10px;line-height: 150%;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;" valign="top"><em>Copyright &copy; 2015 YouPower is developed by the EU research project CIVIS. <a href="http://www.civisproject.eu" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;color: #606060;font-weight: normal;text-decoration: underline;"> More info.</a></em></td> </tr> </table> </td> </tr> </table><!-- // END BODY --> </td> </tr> </table> </td> </tr> </table><br> <br></body></html>';

  var mailOptions = {
      from: user.profile.name + ' via YouPower <youpower.app@gmail.com>', // sender address
      to: mail.name + '<' + mail.email + '>', // list of receivers
      subject: 'Invitation to Join', // Subject line
      // text: mail.message, // plaintext body or HTML body instead
      html: source
      // '<b>' + title 
      //       + 'This is a message from YouPower. </br>'
      //       + 'Private message: ' + mail.message + '</b>'
  };  

  sendMail(mailOptions, cb);
};


var sendMail = function(mailOptions, cb) { 

  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'youpower.app@gmail.com', // YouPower email id
          pass: 'S+bk@4uQ<A6wk0<u3~.o]q6iA' // YouPower email password
      }
  });

  transporter.sendMail(mailOptions, function(err, info){
    cb(err, mailOptions);
  });
};


// fetch user action by id
var getUA = function(user, actionId) {
  return user.actions.pending[actionId] ||
    user.actions.inProgress[actionId] ||
    user.actions.done[actionId] ||
    user.actions.declined[actionId] ||
    user.actions.na[actionId] ||
    {};
};

function isValidDate(d) { 
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
};

Date.prototype.isSameDateAs = function(aDate) {
  return (
    this.getFullYear() === aDate.getFullYear() &&
    this.getMonth() === aDate.getMonth() &&
    this.getDate() === aDate.getDate()
  );
};

exports.setActionState = function(user, actionId, state, postponed, cb) {
  Action.get(actionId, null, function(err, actionResult) {
    if (err) {
      return cb(err);
    }

    // get old UA, if any
    var userAction = getUA(user, actionId);
    if (_.isEmpty(userAction)){
      userAction.postponedDate = [];
      userAction.acceptedDate = [];
      userAction.startedDate = [];
      userAction.alreadyDoingDate = [];
      userAction.doneDate = [];
      userAction.canceledDate = [];
      userAction.declinedDate = [];
      userAction.naDate = []; 
    }


    // update the UA with new data
    userAction._id = actionId;
    userAction.name = actionResult.name;
    userAction.description = actionResult.description;
    userAction.effort = actionResult.effort;
    userAction.impact = actionResult.impact;
    userAction.category = actionResult.category;

    // temporarily get rid of the UA from all UA lists
    delete(user.actions.pending[actionId]);
    delete(user.actions.inProgress[actionId]);
    delete(user.actions.done[actionId]);
    delete(user.actions.declined[actionId]);
    delete(user.actions.na[actionId]);

    var today = new Date(); 
    var latestState = state; 

    // state-specific logic
    if (state === 'pending') {
      postponed = new Date(postponed);
      if (!isValidDate(postponed)) {
        return cb('please provide a valid date in "postponed" field');
      }

      //does the scheudling as usual 
      userAction.postponedDate.push(postponed);
      userAction.acceptedDate.push(today);

      if (userAction.latestState === 'pending'){
        //this is rescheduling 
        if (postponed.isSameDateAs(today) || +postponed < +today){
          //frontend wants to reschudle to today or a past date (time)
          //activate the action (change state automatically to inProgess)
          userAction.startedDate.push(today);
          latestState = 'inProgress';
          state = 'inProgress';
        }else{
          //reschduel to a future date (starting from tomorrow), the reschdueld date may still be earlier than the last scheduled date.
        }
      }else{
        //this is change of state (the usual case), schedule to a future date
      }
    } else if (state === 'inProgress') {
      userAction.startedDate.push(today);
    } else if (state === 'alreadyDoing') {
      userAction.alreadyDoingDate.push(today);
      state = 'done';
    } else if (state === 'done') {
      userAction.doneDate.push(today);
    } else if (state === 'canceled') {
      userAction.canceledDate.push(today);
      state = 'declined';
    } else if (state === 'declined') {
      userAction.declinedDate.push(today);
    } else if (state === 'na') {
      userAction.naDate.push(today);
    } else {
      return cb('invalid value in "state" field');
    }

    userAction.latestDate = today;
    userAction.latestState = latestState;

    user.actions[state][actionId] = userAction;

    // must be manually marked as modified due to mixed type schemas
    user.markModified('actions.pending');
    user.markModified('actions.inProgress');
    user.markModified('actions.done');
    user.markModified('actions.declined');
    user.markModified('actions.na');
    user.save(function(err) {
      cb(err, user.actions);
    });
  });
};

exports.getAchievements = function(user, cb) {
  var stats = achievements.getStats(user);

  cb(null, {
    stats: stats,
    recentAchievements: user.recentAchievements
  });
};

exports.model = User;
