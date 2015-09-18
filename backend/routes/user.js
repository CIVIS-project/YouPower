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
 *
 * @apiExample {curl} Example usage:
 *  # NOTE: this is the only API call which does not require authentication!
 *
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "email": "testuser@test.com",
 *    "name": "Test User",
 *    "password": "topsecret"
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
        name: req.body.name
      }
    }, req.body.password, function(err, user) {
      if (err) {
        return res.status(500).end('error while registering: ' + err);
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

module.exports = router;
