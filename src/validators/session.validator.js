const { body, param } = require('express-validator');

// Hub Contract rule 5: a join code is six digits and does not start with 0.
const codeParam = param('code')
  .matches(/^[1-9][0-9]{5}$/).withMessage('the join code must be six digits');

const createRules = [
  body('question_set_id')
    .exists().withMessage('question_set_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('question_set_id must be a positive whole number')
    .toInt(),
];

const statusRules = [
  codeParam,
  body('status').isIn(['ACTIVE', 'FINISHED']).withMessage('status must be ACTIVE or FINISHED'),
];

const joinRules = [ // nickname VARCHAR(30) NOT NULL
  codeParam,
  body('nickname')
    .exists().withMessage('nickname is required')
    .bail()
    .isString().withMessage('nickname must be text')
    .bail()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('nickname must be 2 to 30 characters long'),
];

module.exports = { codeParam, createRules, statusRules, joinRules };
