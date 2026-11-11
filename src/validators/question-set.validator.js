const { body, param } = require('express-validator');

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

const title = () => body('title') // title VARCHAR(100) NOT NULL
  .exists().withMessage('title is required')
  .bail()
  .isString().withMessage('title must be text')
  .bail()
  .trim()
  .isLength({ min: 3, max: 100 }).withMessage('title must be 3 to 100 characters long');

const createRules = [title()];

// PATCH changes only what is sent: every field is optional, but not all of them at once.
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

module.exports = { idParam, createRules, updateRules };