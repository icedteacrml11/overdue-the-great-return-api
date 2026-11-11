const { matchedData } = require('express-validator');
const sessionService = require('../services/session.service');

function toJson(session) {
  return {
    id: session.id,
    code: session.join_code,
    join_code: session.join_code,
    host_id: session.host_id,
    question_set_id: session.question_set_id,
    status: session.status,
    winner_player_id: session.winner_player_id,
    started_at: session.started_at,
    ended_at: session.ended_at,
    created_at: session.created_at,
  };
}

async function create(req, res) {
  const { question_set_id: questionSetId } = matchedData(req, { locations: ['body'] });
  const session = await sessionService.create(questionSetId, req.user);
  res.status(201).json(toJson(session));
}

async function get(req, res) {
  const { code } = matchedData(req);
  const session = await sessionService.get(code);
  res.status(200).json(toJson(session));
}

async function changeStatus(req, res) {
  const { code, status } = matchedData(req);
  const session = await sessionService.changeStatus(code, status, req.user);
  res.status(200).json(toJson(session));
}

module.exports = { create, get, changeStatus };
