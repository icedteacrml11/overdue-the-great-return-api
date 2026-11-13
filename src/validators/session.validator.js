const { body, param, query } = require('express-validator');

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
  body('status')
    .optional()
    .isIn(['ACTIVE', 'RUNNING', 'FINISHED']).withMessage('status must be ACTIVE, RUNNING, or FINISHED'),
  body('current_position')
    .optional()
    .isInt({ min: 1 }).withMessage('current_position must be a positive whole number')
    .toInt(),
  body().custom((value) => {
    const sent = Object.keys(value || {});
    if (!sent.some((k) => ['status', 'current_position'].includes(k))) {
      throw new Error('send status or current_position');
    }
    return true;
  }),
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

const answerRules = [
  codeParam,
  body('question_id')
    .exists().withMessage('question_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('question_id must be a positive whole number')
    .toInt(),
  body('choice_id')
    .exists().withMessage('choice_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('choice_id must be a positive whole number')
    .toInt(),
];

const leaderboardRules = [
  codeParam,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 60 }).withMessage('limit must be 1 to 60')
    .toInt(),
];

module.exports = { codeParam, createRules, statusRules, joinRules, answerRules, leaderboardRules };
