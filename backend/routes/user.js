'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var util = require('util');
var common = require('./common');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var achievements = require('../common/achievements');
var User = require('../models').users;
var Log = require('../models').logs;
var defaultPath = path.dirname(require.main.filename) + '/res/missingProfile.png';

router.use('/action', require('./userAction'));
router.use('/community', require('./community'));

/**
 * @api {post} /user/register New user registration
 * @apiGroup User
 *
 * @apiParam {String} email User's e-mail address
 * @apiParam {String} name User's nickname
 * @apiParam {String} password User's password
 * @apiParam {String} [language] User's preferred language; for now have support for English (default), Italian and Swedish 
 *
 * @apiExample {curl} Example usage:
 *  # NOTE: this is the only API call which does not require authentication!
 *
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "email": "testuser@test.com",
 *    "name": "Test User",
 *    "password": "topsecret",
 *    "language": "Swedish"
 *  }' \
 *  http://localhost:3000/api/user/register
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "token": "2af38938a7e2aa3daa429278a8f4..."
 *   }
 */
router.post('/register', function(req, res) {
  req.checkBody('email').notEmpty();
  req.checkBody('password').notEmpty();
  req.checkBody('name').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.register({
      email: req.body.email,
      profile: {
        name: req.body.name, 
        language: req.body.language || 'English' 
      }
    }, req.body.password, function(err, user) {
      if (err) {
        return res.status(500).send('Error while registering. ' + err);
      } 

      auth.newUserToken(user, function(err, token) {
        if (achievements.isBeta) {
          achievements.updateAchievement(user, 'betaTester', function() {
            return 1;
          });
        }

        res.successRes(err, {
          token: token
        });
      });
    });
  }

  Log.create({
    category: 'Register User',
    type: 'create',
    data: req.body
  });
});

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization Authorization token
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Bearer 615ea82f7fec0ffaee5..."
 */

/**
 * @api {get} /user/profile Get your profile
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/profile
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "email": "testuser1@test.com",
 *     "profile": {
 *       "name": "Test User"
 *     },
 *     "actions": {
 *       "pending": {},
 *       "inProgress": {},
 *       "done": {},
 *       "declined": {},
 *       "na": {}
 *     },
 *     "leaves": 42,
 *     "householdId": null,
 *     "pendingHouseholdInvites": [
 *      '5562c1d46b1083a13e5b7843'
 *     ],
 *     "pendingCommunityInvites" [
 *      '5562c1d46b1083a13e5b7844'
 *     ],
 *     "energyConsumption": {},
 *     "production": 0
 *   }
 *
 * @apiVersion 1.0.0
 */
router.get('/profile', auth.authenticate(), function(req, res) {
  User.getProfile(req.user._id, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Own User Profile',
    type: 'get'
  });
});


/**
 * @api {get} /user/invites Get your pending invites
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/invites
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "pendingHouseholdInvites": [
 *      '5562c1d46b1083a13e5b7843'
 *     ],
 *     "pendingCommunityInvites" [
 *      '5562c1d46b1083a13e5b7844'
 *     ]
 *   }
 *
 */
router.get('/invites', auth.authenticate(), function(req, res) {
  User.getInvites(req.user._id, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Own Pending Invites',
    type: 'get',
    data: res.successRes
  });
});

/**
 * @api {get} /user/actions List user's actions based on type of actions
 * @apiGroup User
 *
 * @apiParam {String} q Search query
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/actions\?q\=foobar
 */
router.get('/actions', auth.authenticate(), function(req, res) {
  req.checkQuery('q', 'Invalid query parameter').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.getUserActions(req.user._id, req.query.q, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'User Actions',
      type: 'get',
      data: req.query
    });
  }
});

/**
 * @api {post} /user/profile Update your profile
 * @apiGroup User
 *
 * @apiParam {String} [name] Your nickname
 * @apiParam {Date} [dob] Your date of birth
 * @apiParam {String} [photo] Profile photo
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "New Name",
 *    "dob": "11 25 1990"
 *  }' \
 *  http://localhost:3000/api/user/profile
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "dob": "1990-11-25T00:00:00.000Z",
 *   "name": "New Name"
 * }
 */
router.post('/profile', auth.authenticate(), function(req, res) {
  req.checkBody('dob').optional().isDate();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.updateProfile(req.user, req.body, res.successRes);
  }

  Log.create({
    userId: req.user._id,
    category: 'Own User Profile',
    type: 'update',
    data: req.body
  });
});

/**
 * @api {post} /user/sendMail/:type Send an Email invitation
 * @apiGroup User
 *
 * @apiParam {String} type Type of the invitation. Can be one of:
 *
 *   - **householdMember**: The mail receiver is invited to sign up YouPower and to join the sender's household
 *   - **TODO**: The mail receiver is invited to sign up YouPower
 * 
 * @apiParam {String} email Email address of the receiver
 * @apiParam {String} [name] Name of the receiver
 * @apiParam {String} [message] The sender's private message to the receiver
 * 
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Receiver Name",
 *    "email": "receiver@example.com",
 *    "message": "A private message"
 *  }' \
 *  http://localhost:3000/api/user/user/sendMail/householdMember
 *
 */
router.post('/sendMail/:type', auth.authenticate(), function(req, res) {
  req.checkBody('email').notEmpty(); 

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else if (req.params.type === 'householdMember'){
    User.mailHouseholdMember(req.user, req.body, res.successRes);
  } else {
    res.successRes
  }

  Log.create({
    userId: req.user._id,
    category: 'User Mail Invite',
    type: req.params.type,
    data: req.body
  });
});


router.post('/sendMail/householdMember', auth.authenticate(), function(req, res) {
  req.checkBody('email').notEmpty(); 

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.mailHouseholdMember(req.user, req.body, res.successRes);
  }

  Log.create({
    userId: req.user._id,
    category: 'User Mail Invite',
    type: 'householdMember',
    data: req.body
  });
});

/**
 * @api {get} /user/profilePicture/:userId Get user's profile picture
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN"
 *  http://localhost:3000/api/user/profilePicture/:userId
 *
 * @apiSuccessExample {binary} Success-Response:
 * <image data>
 */
router.get('/profilePicture/:userId', auth.authenticate(), function(req, res) {
  var imgPath = path.join(common.getUserHome(), '.youpower', 'profilePictures',
      req.params.userId + '.png');

  fs.exists(imgPath, function(exists) {
    var stream = fs.createReadStream(exists ? imgPath : defaultPath);
    stream.pipe(res);
    stream.on('error', function(err) {
      res.successRes(err);
    });
  });

  Log.create({
    userId: req.user._id,
    category: 'User Profile Picture',
    type: 'get',
    data: req.params.userId
  });
});

/**
 * @api {post} /user/profilePicture Update your profile picture
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: image/png" -H "Authorization: Bearer $API_TOKEN" \
 *  --data-binary @/path/to/picture.png \
 *  http://localhost:3000/api/user/profilePicture
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "msg": "success"
 * }
 */
router.post('/profilePicture', auth.authenticate(), function(req, res) {
  var imgPath = path.join(common.getUserHome(), '.youpower', 'profilePictures');
  common.uploadPicture(req, 256, imgPath, req.user._id, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Profile Picture',
    type: 'update'
  });
});

/**
 * @api {get} /user/profile/:userId Get another user's profile
 * @apiGroup User
 *
 * @apiParam {String} userId userId of desired user
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/profile/555f0163688305b57c7cef6c
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "email": "testuser1@test.com",
 *   "profile": {
 *     "name": "Test User"
 *   },
 *   "actions": {
 *     "pending": {},
 *     "inProgress": {},
 *     "done": {},
 *     "declined": {},
 *     "na": {}
 *   },
 *   "leaves": 42,
 *   "householdId": null,
 *   "energyConsumption": {},
 *   "production": 0
 *  }
 */
router.get('/profile/:userId', auth.authenticate(), function(req, res) {
  User.getProfile(req.params.userId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Profile',
    type: 'get',
    data: req.params.userId
  });
});

/**
 * @api {get} /user/search Search for users
 * @apiGroup User
 *
 * @apiParam {String} [email] Search by email
 * @apiParam {String} [name] Search by user's profile name 
 * @apiParam {String} [userId] Search by user's MongoId
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Test User"
 *  }' \
 *  http://localhost:3000/api/user/search
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *     {
 *       "_id": "5562c1d46b1083a13e5b7843",
 *       "email": "testUser@foo.com",
 *       "profile": {
 *         "name": "Test User",
 *         ...
 *       }
 *     },
 *     ...
 *   ]
 *
 * @apiVersion 1.0.0
 */
router.get('/search', auth.authenticate(), function(req, res) {

  // console.log("req.params:" + JSON.stringify(req.params, null, 4)); 
  // console.log("req.body:" + JSON.stringify(req.body, null, 4)); 
  // console.log("req.query:" + JSON.stringify(req.query, null, 4)); 

  User.find(req.query, true, 50, null, res.successRes); 

  Log.create({
    userId: req.user._id,
    category: 'User Profile',
    type: 'find',
    data: req.query
  });
});

/**
 * @api {post} /user/token Generate new API token
 * @apiGroup User
 *
 * @apiHeader {String} Authorization HTTP Basic Authentication credentials
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
 *
 * @apiExample {curl} Example usage:
 *  # NOTE: exceptionally uses your email:password, replace them in the export command below!
 *  export HTTP_BASIC=$(echo -n "testuser1@test.com:topsecret" | base64)
 *
 *  curl -i -X POST -H "Authorization: Basic $HTTP_BASIC" \
 *  http://localhost:3000/api/user/token
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "token": "615ea82f7fec0ffaee5..."
 *   }
 *
 * @apiVersion 1.0.0
 */
router.post('/token', auth.basicauth(), function(req, res) {
  auth.newUserToken(req.user, function(err, token) {
    res.successRes(err, {
      token: token
    });
  });

  Log.create({
    userId: req.user._id,
    category: 'User Token',
    type: 'post'
  });
});

/**
 * @api {get} /user/token Get current API token
 * @apiGroup User
 *
 * @apiHeader {String} Authorization HTTP Basic Authentication credentials
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
 *
 * @apiExample {curl} Example usage:
 *  # NOTE: exceptionally uses your email:password, replace them in the export command below!
 *  export HTTP_BASIC=$(echo -n "testuser1@test.com:topsecret" | base64)
 *
 *  curl -i -X GET -H "Authorization: Basic $HTTP_BASIC" \
 *  http://localhost:3000/api/user/token
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "token": "615ea82f7fec0ffaee5..."
 *   }
 *
 * @apiVersion 1.0.0
 */
router.get('/token', auth.basicauth(), function(req, res) {
  res.successRes(req.user.token ? null : 'User token not found', {
    token: req.user.token
  });

  Log.create({
    userId: req.user._id,
    category: 'User Token',
    type: 'get'
  });
});

/**
 * @api {get} /user/:userId/achievements Get user's achievements
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/555f0163688305b57c7cef6c/achievements
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     TODO
 *   }
 *
 * @apiVersion 1.0.0
 */
router.get('/:userId/achievements', auth.authenticate(), function(req, res) {
  User.find({_id: req.params.userId}, false, null, null, function(err, user) {
    if (err) {
      return res.successRes(err);
    }
    if (!user) {
      return res.successRes('user not found');
    }

    User.getAchievements(user, res.successRes);
  });

  Log.create({
    userId: req.user._id,
    category: 'User Achievements',
    type: 'get',
    data: req.params.userId
  });
});

/**
 * @api {get} /user/:userId/fbfriends Get user's friends from facebook
 * @apiGroup User
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/555f0163688305b57c7cef6c/fbfriends
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *      {
 *          "_id": "55db07f688c54b2331c1536d",
 *          "profile": {
 *              "name": "John Amicifhiijch Rosenthalberg",
 *              "gender": "male",
 *              "dob": "1980-08-07T22:00:00.000Z"
 *          }
 *      },
 *      {
 *          "_id": "55dd7f4b313bc4551d8cecbe",
 *          "profile": {
 *              "name": "Betty Amifjibhgdbg Fergieson",
 *              "gender": "female",
 *              "dob": "1980-08-07T22:00:00.000Z"
 *          }
 *      },..
 *    ]
 *
 * @apiVersion 1.0.0
 */
router.get('/:userId/fbfriends', auth.authenticate(), function(req, res) {
  User.find({_id: req.params.userId}, false, null, null, function(err, user) {
    if (err) {
      return res.successRes(err);
    }
    if (!user) {
      return res.successRes('user not found');
    }
    console.log('USERRRXXX',user);
    User.fbfriends(user, res.successRes);
  });

  Log.create({
    userId: req.user._id,
    category: 'User Find fb friends',
    type: 'get',
    data: req.params.userId
  });
});

/**
 * @api {post} /user/postFB/:type/:id Post on Facebook
 * @apiGroup User
 *
 * @apiParam {String} type Indicates the content of the post (or share), e.g. "action" means that the post is about an action 
 * @apiParam {String} id The id of the content, e.g. if type is "action", then the id is an actoin id
 * @apiParam (Body) {Object} object The content to be posted. Details see: 
 <a href="https://developers.facebook.com/docs/graph-api/reference/v2.4/post">https://developers.facebook.com/docs/graph-api/reference/v2.4/post</a>
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "message": "Hey I completed xyz challenge. (You can also add a link to a photograph)"
 *  }' \
 *  http://localhost:3000/api/user/postFB/action/555f0163688305b57c7cef6c
 *
 * @apiSuccessExample {json} Success-Response:
 * {//id is post_id from facebook
 *   "id":"10155784135330422_10156011152545422"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * {//if error occurs
 *  "message": "Duplicate status message",
 *  "type": "FacebookApiException",
 *  "code": 506,
 *  "error_subcode": 1455006,
 *  "is_transient": false,
 *  "error_user_title": "Duplicate Status Update",
 *  "error_user_msg": "This status update is identical to the last one.."
 * }
 */
router.post('/postFB/:type/:id', auth.authenticate(), function(req, res) {

  console.log("req.params: "+JSON.stringify(req.params, null, 4));

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.postFB(req.user, req.params, req.body, res.successRes);
  }

  Log.create({
    userId: req.user._id,
    category: 'POST on FB',
    type: 'post',
    data: req.body
  });
});

module.exports = router;
