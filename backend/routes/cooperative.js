'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var util = require('util');
var path = require('path');
var common = require('./common');
var fs = require('fs');
var router = express.Router();
var Cooperative = require('../models').cooperatives;
var Log = require('../models').logs;

/**
 * @api {post} /cooperative Create new cooperative
 * @apiGroup Cooperative
 *
 * @apiParam {String} name Cooperative name
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "BRF Hamarby",
 *  }' \
 *  http://localhost:3000/api/cooperative
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "_id": "55f14ce337d4bef728a861ab",
 *     "name": "BRF Hamarby"
 *   }
 */
router.post('/', function(req, res) {
  var cooperative = req.body;
  Cooperative.create(cooperative, res.successRes);

  Log.create({
    // userId: req.user._id,
    category: 'Cooperative',
    type: 'create',
    data: req.body
  });
});

/**
 * @api {get} /cooperative/:id Fetch an cooperative by id
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *   }
 */
router.get('/:id', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.get(req.params.id, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'get',
      data: {
        cooperativeId: req.params.id
      }
    });
  }
});

router.get('/', function(req, res) {
  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.all(res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'get'
    });
  }
});

router.put('/:id', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.update(req.params.id, req.body, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'update',
      data: req.body
    });
  }
});

router.post('/:id/action', function(req, res) {
 
    req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.addAction(req.params.id, req.body, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'addAction',
      data: {
        cooperativeId: req.params.id,
        action: req.body
      }
    });
  }
});

router.put('/:id/action/:actionId', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('actionId', 'Invalid cooperative action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.updateAction(req.params.id, req.params.actionId, req.body, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'updateAction',
      data: {
        cooperativeId: req.params.id,
        actionId: req.params.actionId,
        action: req.body
      }
    });
  }
});

router.delete('/:id/action/:actionId', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('actionId', 'Invalid cooperative action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.deleteAction(req.params.id, req.params.actionId, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'deleteAction',
      data: {
        cooperativeId: req.params.id,
        actionId: req.params.actionId
      }
    });
  }
});

router.post('/:id/action/:actionId/comment', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('actionId', 'Invalid cooperative action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.commentAction(req.params.id, req.params.actionId, req.body, req.user, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'commentAction',
      data: {
        cooperativeId: req.params.id,
        actionId: req.params.actionId,
        comment: req.body
      }
    });
  }
});

router.get('/:id/action/:actionId/comment', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('actionId', 'Invalid cooperative action id').isMongoId();
  req.checkQuery('lastCommentId', 'Invalid comment id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.getMoreComments(req.params.id, req.params.actionId, req.query.lastCommentId, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'getMoreComments',
      data: {
        cooperativeId: req.params.id,
        actionId: req.params.actionId,
        lastCommentId: req.params.lastCommentId
      }
    });
  }
});


router.delete('/:id/action/:actionId/comment/:commentId', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('actionId', 'Invalid cooperative action id').isMongoId();
  req.checkParams('commentId', 'Invalid comment id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.deleteActionComment(req.params.id, req.params.actionId, req.params.commentId, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'deleteActionComment',
      data: {
        cooperativeId: req.params.id,
        actionId: req.params.actionId,
        commentId: req.params.commentId
      }
    });
  }
});


router.post('/:id/editor', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.addEditor(req.params.id, req.body, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'addEditor',
      data: {
        cooperativeId: req.params.id,
        editor: req.body
      }
    });
  }
});

router.delete('/:id/editor/:coopEditorId', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();
  req.checkParams('coopEditorId', 'Invalid cooperative editor id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.deleteEditor(req.params.id, req.params.coopEditorId, null, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'deleteEditor',
      data: {
        cooperativeId: req.params.id,
        coopEditorId: req.params.coopEditorId
      }
    });
  }
});


module.exports = router;
