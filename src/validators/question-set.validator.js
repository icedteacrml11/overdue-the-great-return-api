const { body, param, query } = require('express-validator');
const { pageRules, sortRules } = require('./list.validator');

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

const questionIdParam = param('questionId')
  .isInt({ min: 1 }).withMessage('questionId must be a positive whole number')
  .toInt();

const listRules = [
  ...pageRules,
  ...sortRules(['id', 'title', 'created_at']),
  query('q')
    .optional()
    .isString().withMessage('q must be text')
    .trim()
    .isLength({ max: 100 }).withMessage('q must be at most 100 characters long'),
];

const getRules = [
  idParam,
  query('include')
    .optional()
    .isIn(['questions']).withMessage('include must be questions'),
];

const title = () => body('title')
  .exists().withMessage('title is required')
  .bail()
  .isString().withMessage('title must be text')
  .bail()
  .trim()
  .isLength({ min: 3, max: 100 }).withMessage('title must be 3 to 100 characters long');

const createRules = [title()];

const updateRules = [
  idParam,
  title().optional(),
  body().custom((value) => {
    const sent = Object.keys(value || {});
    if (!sent.some((key) => ['title'].includes(key))) {
      throw new Error('send at least one of: title');
    }
    return true;
  }),
];

const promptText = () => body('prompt_text')
  .exists().withMessage('prompt_text is required')
  .bail()
  .isString().withMessage('prompt_text must be text')
  .bail()
  .trim()
  .isLength({ min: 3, max: 500 }).withMessage('prompt_text must be 3 to 500 characters long');

const questionType = () => body('question_type')
  .optional()
  .isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE']).withMessage('question_type must be MULTIPLE_CHOICE or TRUE_FALSE');

const timeLimitSeconds = () => body('time_limit_seconds')
  .optional()
  .isInt({ min: 5, max: 120 }).withMessage('time_limit_seconds must be 5 to 120 seconds')
  .toInt();

const choicesRules = (required = true) => {
  const base = body('choices');
  const chain = required
    ? base.exists().withMessage('choices is required').bail()
    : base.optional();
  return [
    chain
      .isArray({ min: 2, max: 4 }).withMessage('choices must be a list of 2 to 4 items')
      .bail()
      .custom((choices) => {
        const correct = choices.filter((c) => c && c.is_correct === true).length;
        if (correct !== 1) {
          throw new Error('choices must have exactly one correct choice');
        }
        return true;
      }),
    body('choices.*.choice_text')
      .if(body('choices').exists())
      .exists().withMessage('choice_text is required for every choice')
      .bail()
      .isString().withMessage('choice_text must be text')
      .bail()
      .trim()
      .isLength({ min: 1, max: 255 }).withMessage('choice_text must be 1 to 255 characters long'),
    body('choices.*.is_correct')
      .if(body('choices').exists())
      .isBoolean().withMessage('is_correct must be true or false'),
  ];
};

const createQuestionRules = [
  idParam,
  promptText(),
  questionType(),
  timeLimitSeconds(),
  ...choicesRules(true),
];

const updateQuestionRules = [
  idParam,
  questionIdParam,
  promptText().optional(),
  questionType(),
  timeLimitSeconds(),
  ...choicesRules(false),
  body().custom((value) => {
    const sent = Object.keys(value || {});
    if (!sent.some((key) => ['prompt_text', 'question_type', 'time_limit_seconds', 'choices'].includes(key))) {
      throw new Error('send at least one of: prompt_text, question_type, time_limit_seconds, choices');
    }
    return true;
  }),
];

const questionParamRules = [idParam, questionIdParam];

module.exports = {
  idParam,
  questionIdParam,
  listRules,
  getRules,
  createRules,
  updateRules,
  createQuestionRules,
  updateQuestionRules,
  questionParamRules,
};
