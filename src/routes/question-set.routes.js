const { Router } = require('express');
const controller = require('../controllers/question-set.controller');
const rules = require('../validators/question-set.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');
const uploadCover = require('../middlewares/upload-cover');

const router = Router();

router.use(requireUser('HOST', 'ADMIN')); // every endpoint in this file is for hosts

router.get('/', rules.listRules, validate, controller.list);
router.post('/', rules.createRules, validate, controller.create);
router.get('/:id', rules.getRules, validate, controller.get);
router.patch('/:id', rules.updateRules, validate, controller.update);
router.delete('/:id', rules.idParam, validate, controller.remove);
router.put('/:id/cover', rules.idParam, validate, uploadCover, controller.uploadCover);

router.get('/:id/questions', rules.idParam, validate, controller.listQuestions);
router.post('/:id/questions', rules.createQuestionRules, validate, controller.createQuestion);
router.patch('/:id/questions/:questionId', rules.updateQuestionRules, validate, controller.updateQuestion);
router.delete('/:id/questions/:questionId', rules.questionParamRules, validate, controller.removeQuestion);

module.exports = router;
