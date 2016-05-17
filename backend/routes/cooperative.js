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
 * @api {get} /cooperative/consumption Get average consumption for cooperatives
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
router.get('/consumption/:type/:granularity', function(req, res) {
  Cooperative.getAvgConsumption(req.params.type, req.params.granularity, req.query.from, req.query.to, res.successRes);
  Log.create({
    // userId: req.user._id,
    category: 'Cooperative',
    type: 'geAvgConsumption',
    data: {
      params: req.params
    }
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


/**
 * @api {get} /cooperative/ Get list of all cooperatives
 * @apiGroup Cooperative
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/
 *
 * @apiSuccessExample {json} Success-Response:
 *   [{
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 *   ...
 *   ]
 */
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

/**
 * @api {put} /cooperative/:id Update the cooperative information
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam (Body) {String} name Cooperative name
 * @apiParam (Body) {String} email Cooperative contact email
 * @apiParam (Body) {Number} yearOfConst Year of construction of the cooperative
 * @apiParam (Body) {Number} area Area in square meters of the cooperative shared space
 * @apiParam (Body) {Number} numOfApartments Number of apartments in the cooperative
 * @apiParam (Body) {String} ventilationType Ventilation type
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "New Cooperative"
 *    "email": "new@example.com"
 *  }' \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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


/**
 * @api {post} /cooperative/:id/meter Add new meter to cooperative
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam (Body) {String} meterId Id of the new meter
 * @apiParam (Body) {String} type Type of the new meter (e.g. electricity, heating)
 * @apiParam (Body) {Boolean} useInCalc Whether to use the meter reading in energy calculations
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUSH -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "meterId": "12341234",
 *    "type": "electricity",
 *    "useInCalc": true
 *  }' \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/meter
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
router.post('/:id/meter', function(req, res) {

  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.addMeter(req.params.id, req.body.meterId, req.body.type, req.body.useInCalc, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'addMeter',
      data: {
        cooperativeId: req.params.id,
        params: req.body
      }
    });
  }
});

/**
 * @api {post} /cooperative/:id/meter Add new cooperative action
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam (Body) {String} name Name of the action
 * @apiParam (Body) {Date} date Date when action was taken
 * @apiParam (Body) {String} description Action description
 * @apiParam (Body) {Number} cost Action cost
 * @apiParam (Body) {Number[]} types Action types
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUSH -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Ventilation change",
 *    "cost": "120"
 *  }' \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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


/**
 * @api {put} /cooperative/:id/action/:actionId Update cooperative action
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} actionId MongoId of the action
 * @apiParam (Body) {String} name Name of the action
 * @apiParam (Body) {Date} date Date when action was taken
 * @apiParam (Body) {String} description Action description
 * @apiParam (Body) {Number} cost Action cost
 * @apiParam (Body) {Number[]} types Action types
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Ventilation change",
 *    "cost": "120"
 *  }' \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action/55f14ce337dlkabef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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

/**
 * @api {delete} /cooperative/:id/action/:actionId Delet cooperative action
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} actionId MongoId of the action
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action/55f14ce337dlkabef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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

/**
 * @api {post} /cooperative/:id/action/:actionId/comment Comment cooperative action
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} actionId MongoId of the action
 * @apiParam (Body) {String} comment The text of the comment
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "comment": "Nice job"
 *  }' \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action/55f14ce337dlkabef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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

/**
 * @api {get} /cooperative/:id/action/:actionId/comment Load more comments
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} actionId MongoId of the action
 * @apiParam (Query) {String} lastCommentId MongoId of the last comment retrieved
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action/55f14ce337dlkabef728a861ab/comment?lastCommentId=65f14ce337dlkabef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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

/**
 * @api {delete} /cooperative/:id/action/:actionId/comment/:commentId Delete cooperative action comments
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} actionId MongoId of the action
 * @apiParam {String} commentId MongoId of the comment
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/action/55f14ce337dlkabef728a861ab/comment/12983ujaw9210
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "name": "BRF Hamarby"
 *     ...
 *   }
 */
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


/*
curl  -X POST http://localhost:3000/api/cooperative/5623feb4fa9bee84098e7ce0/editor -d'{"editorId" : "55f91cacf9b31654b8758efd"}' -H "Content-Type: application/json" | python -m json.tool
*/
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

/**
 curl  -X DELETE http://localhost:3000/api/cooperative/5623feb4fa9bee84098e7ce0/editor/56240d8a830db5840a70571a | python -m json.tool
*/
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

/**
 * @api {get} /cooperative/:id/consumption/:type/:granularity Get cooperative consumption
 * @apiGroup Cooperative
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiParam {String} type Consumption type (e.g. electricity, heating)
 * @apiParam {String} granularity Granularity (e.g. year, month)
 * @apiParam {String} from Range date of consumption in YYYYMM-YYYYMM format (MM is optional)
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab/consumption/electricity/month?from=201505-201604
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *   5.335204147764095,
 *   3.957101425793908,
 *   3.3761681788723266
 *   ...
 *   ]
 */
router.get('/:id/consumption/:type/:granularity', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Cooperative.getConsumption(req.params.id, req.params.type, req.params.granularity, req.query.from, req.query.to, res.successRes);

    Log.create({
      // userId: req.user._id,
      category: 'Cooperative',
      type: 'geConsumption',
      data: {
        cooperativeId: req.params.id,
        params: req.params
      }
    });
  }
});


module.exports = router;
