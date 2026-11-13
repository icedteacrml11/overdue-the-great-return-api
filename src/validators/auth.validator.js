const { body, param } = require('express-validator');

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

const registerRules = [
  body('school_id')
    .exists().withMessage('school_id is required').bail()
    .isString().withMessage('school_id must be text').bail()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('school_id must match YYYY-NNNN (for example, 2099-0001)'),
  body('full_name')
    .exists().withMessage('full_name is required').bail()
    .isString().withMessage('full_name must be text').bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('full_name must be 2 to 100 characters long'),
  body('email')
    .exists().withMessage('email is required').bail()
    .isString().withMessage('email must be text').bail()
    .trim()
    .toLowerCase()
    .isEmail().withMessage('email must be a valid email address')
    .isLength({ max: 100 }).withMessage('email must be at most 100 characters long'),
  body('password')
    .exists().withMessage('password is required').bail()
    .isString().withMessage('password must be text').bail()
    .isLength({ min: 8, max: 72 }).withMessage('password must be 8 to 72 characters long')
    .matches(/[A-Za-z]/).withMessage('password must contain at least one letter')
    .matches(/[0-9]/).withMessage('password must contain at least one number'),
];

const loginRules = [
  body('school_id')
    .exists().withMessage('school_id is required').bail()
    .isString().withMessage('school_id must be text').bail()
    .trim()
    .notEmpty().withMessage('school_id is required'),
  body('password')
    .exists().withMessage('password is required').bail()
    .isString().withMessage('password must be text').bail()
    .notEmpty().withMessage('password is required'),
];

const roleRules = [
  idParam,
  body('role')
    .exists().withMessage('role is required').bail()
    .isString().withMessage('role must be text').bail()
    .isIn(['PLAYER', 'HOST', 'ADMIN']).withMessage('role must be one of: PLAYER, HOST, ADMIN'),
];

module.exports = { idParam, registerRules, loginRules, roleRules };

