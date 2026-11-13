const { Router } = require('express');
const sessionController = require('../controllers/session.controller');
const playerController = require('../controllers/player.controller');
const rules = require('../validators/session.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

router.post('/', requireUser('HOST', 'ADMIN'), rules.createRules, validate, sessionController.create);
router.get('/:code', rules.codeParam, validate, sessionController.get);
router.patch('/:code', requireUser('HOST', 'ADMIN'), rules.statusRules, validate, sessionController.changeStatus);

// Players are a part of a session, so their URLs sit under it.
router.post('/:code/players', requireUser(), rules.joinRules, validate, playerController.join);
router.get('/:code/players', rules.codeParam, validate, playerController.list);

// Gameplay endpoints (Milestone 3)
router.get('/:code/question', rules.codeParam, validate, sessionController.getCurrentQuestion);
router.post('/:code/answers', requireUser(), rules.answerRules, validate, sessionController.submitAnswer);
router.get('/:code/leaderboard', rules.leaderboardRules, validate, sessionController.getLeaderboard);

module.exports = router;
