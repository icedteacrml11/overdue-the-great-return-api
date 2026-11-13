const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const rules = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

router.use(requireUser('ADMIN'));

router.get('/', controller.listUsers);
router.patch('/:id/role', rules.roleRules, validate, controller.changeRole);

module.exports = router;

