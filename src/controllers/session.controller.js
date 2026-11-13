const { matchedData } = require('express-validator');
const sessionService = require('../services/session.service');
const gameplayService = require('../services/gameplay.service');

function toJson(session) {
  return {
    id: session.id,
    code: session.join_code,
    join_code: session.join_code,
    host_id: session.host_id,
    question_set_id: session.question_set_id,
    status: session.status,
    current_position: session.current_position,
    question_started_at: session.question_started_at,
    winner_player_id: session.winner_player_id,
    started_at: session.started_at,
    ended_at: session.ended_at,
    created_at: session.created_at,
  };
}

// Never include is_correct in the active question sent to players!
function toPublicQuestionJson(question, questionStartedAt) {
  return {
    id: question.id,
    question_set_id: question.question_set_id,
    question_type: question.question_type,
    prompt_text: question.prompt_text,
    position: question.position,
    time_limit_seconds: question.time_limit_seconds,
    question_started_at: questionStartedAt,
    choices: Array.isArray(question.choices)
      ? question.choices.map((c) => ({
          id: c.id,
          question_id: c.question_id,
          choice_text: c.choice_text,
          position: c.position,
        }))
      : [],
  };
}

async function create(req, res) {
  const { question_set_id: questionSetId } = matchedData(req, { locations: ['body'] });
  const session = await sessionService.create(questionSetId, req.user);
  res.status(201).json(toJson(session));
}

async function get(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const session = await sessionService.get(code);
  res.status(200).json(toJson(session));
}

async function changeStatus(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const session = await sessionService.changeStatus(code, changes, req.user);
  res.status(200).json(toJson(session));
}

async function getCurrentQuestion(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const { session, question } = await gameplayService.getCurrentQuestion(code);
  res.status(200).json(toPublicQuestionJson(question, session.question_started_at));
}

async function submitAnswer(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const body = matchedData(req, { locations: ['body'] });
  const result = await gameplayService.submitAnswer(code, body, req.user);
  res.status(201).json(result);
}

async function getLeaderboard(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const { limit } = matchedData(req, { locations: ['query'] });
  const result = await gameplayService.getLeaderboard(code, limit || 10);
  res.status(200).json(result);
}

module.exports = {
  create,
  get,
  changeStatus,
  getCurrentQuestion,
  submitAnswer,
  getLeaderboard,
};
