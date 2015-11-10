'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var router = express.Router();
var achievements = require('../common/achievements');
var User = require('../models').users;
var Action = require('../models').actions;
var Log = require('../models').logs;

/**
 * @api {get} /user/action Get user's action list
 * @apiGroup User Action
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/action
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "pending": {},
 *   "inProgress": {
 *     "55b230d69a8c96f177154fa1": {
 *       "_id": "55b230d69a8c96f177154fa1",
 *       "name": "Disable standby",
 *       "description": "Turn off and unplug standby power of TV, stereo, computer, etc.",
 *       "effort": 2,
 *       "impact": 2,
 *       "category": null,
 *       "startedDate": "2015-08-11T10:31:39.934Z"
 *     },
 *     "55b230d69a8c96f177154fa2": {
 *       "startedDate": "2015-08-11T10:43:33.485Z",
 *       "impact": 3,
 *       "effort": 4,
 *       "description": "Find and seal up leaks",
 *       "name": "Leaks",
 *       "_id": "55b230d69a8c96f177154fa2"
 *     }
 *   },
 *   "done": {},
 *   "declined": {},
 *   "na": {}
 * }
 */
router.get('/', auth.authenticate(), function(req, res) {
  res.json(req.user.actions);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'get',
    data: {}
  });
});

/**
 * @api {get} /user/action/suggested Get list of suggested user actions
 * @apiGroup User Action
 * @apiDescription Returns top three most recent actions that the user has not tried
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/user/action/suggested
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *   {
 *     "__v": 0,
 *     "_id": "555f0163688305b57c7cef6c",
 *     "description": "Disabling standby can save up to 10% in total electricity costs.",
 *     "effort": 2,
 *     "impact": 2,
 *     "name": "Disable standby on your devices",
 *     "ratings": []
 *   },
 *   {
 *     ...
 *   }
 * ]
 *
 * @apiVersion 1.0.0
 */
router.get('/suggested', auth.authenticate(), function(req, res) {
  Action.getSuggested(req.user, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'getSuggested',
    data: res.successRes
  });
});

/**
 * @api {post} /user/action/:actionId Change state for user action
 * @apiGroup User Action
 * @apiDescription Used to start/stop actions for a user.
 *
 * @apiParam {String} actionId Action's MongoId
 * @apiParam {String} state Can be one of: 'pending', 'inProgress', 'alreadyDoing',
 * 'done', 'canceled', 'declined', 'na'.
 * @apiParam {Date} postponed Must be provided if state is 'pending'. Specifies
 * at which time the user will be reminded of the action again.
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d \
 *  '{
 *    "state": "inProgress"
 *  }' \
 *  http://localhost:3000/api/user/action/55b230d69a8c96f177154fa1
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "pending": {},
 *   "inProgress": {
 *     "55b230d69a8c96f177154fa1": {
 *       "_id": "55b230d69a8c96f177154fa1",
 *       "name": "Disable standby",
 *       "description": "Turn off and unplug standby power of TV, stereo, computer, etc.",
 *       "effort": 2,
 *       "impact": 2,
 *       "category": null,
 *       "startedDate": "2015-08-11T10:31:39.934Z"
 *     },
 *     "55b230d69a8c96f177154fa2": {
 *       "startedDate": "2015-08-11T10:43:33.485Z",
 *       "impact": 3,
 *       "effort": 4,
 *       "description": "Find and seal up leaks",
 *       "name": "Leaks",
 *       "_id": "55b230d69a8c96f177154fa2"
 *     }
 *   },
 *   "done": {},
 *   "declined": {},
 *   "na": {}
 * }
 */
router.post('/:actionId', auth.authenticate(), function(req, res) {
  User.setActionState(req.user, req.params.actionId, req.body.state, req.body.postponed,
  function(err, user) {
    if (!err) {
      achievements.updateAchievement(req.user, 'actionsDone', function(oldVal) {
        // make sure we never decerase the action count
        return Math.max(oldVal, user.actions ? user.actions.done.length : 0);
      });
    }

    res.successRes(err, user);
  });

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'update',
    data: req.body
  });
});

module.exports = router;
