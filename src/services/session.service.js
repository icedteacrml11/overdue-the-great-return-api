const sessionRepository = require('../repositories/session.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const questionRepository = require('../repositories/question.repository');
const playerRepository = require('../repositories/player.repository');
const { constraintOf } = require('../errors/db-errors');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Rule: which status may follow which.
const NEXT_STATUS = {
  LOBBY: ['ACTIVE', 'RUNNING', 'FINISHED'],
  ACTIVE: ['FINISHED'],
  RUNNING: ['FINISHED'],
  FINISHED: [],
};

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) throw notFound('SESSION_NOT_FOUND', `No game session has the code ${code}.`);
  return session;
}

async function create(questionSetId, user) {
  const questionSet = await questionSetRepository.findById(questionSetId);
  if (!questionSet) {
    throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${questionSetId}.`);
  }
  const mayUse = questionSet.host_id === user.user_id || user.role === 'ADMIN';
  if (!mayUse) throw forbidden('This question set belongs to another host.');

  const totalQuestions = await questionRepository.countBySetId(questionSet.id);
  if (totalQuestions === 0) {
    throw conflict('EMPTY_QUESTION_SET', 'Add at least one question before starting a game.');
  }

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await sessionRepository.create({
        question_set_id: questionSet.id,
        host_id: user.user_id,
        join_code: randomCode(),
      });
    } catch (error) {
      if (constraintOf(error) !== 'sessions_join_code_key') throw error;
    }
  }
  throw new Error('Could not find a free join code after 5 attempts.');
}

function get(code) {
  return findOrFail(code);
}

async function changeStatus(code, payload, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id && user.role !== 'ADMIN') {
    throw forbidden('This game belongs to another host.');
  }

  const status = typeof payload === 'string' ? payload : payload.status;
  const nextPosition = typeof payload === 'object' && payload !== null ? payload.current_position : undefined;
  const changes = {};

  if (status !== undefined) {
    if (!NEXT_STATUS[session.status].includes(status)) {
      throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot become ${status}.`);
    }
    changes.status = status;
    if (status === 'ACTIVE' || status === 'RUNNING') {
      const now = new Date();
      changes.started_at = now;
      changes.current_position = 1;
      changes.question_started_at = now;
    }
    if (status === 'FINISHED') {
      changes.ended_at = new Date();
      const players = await playerRepository.findAllBySession(session.id);
      if (players.length > 0) {
        changes.winner_player_id = players[0].id;
      }
    }
  }

  if (nextPosition !== undefined && status === undefined) {
    if (!['ACTIVE', 'RUNNING'].includes(session.status)) {
      throw conflict('SESSION_NOT_ACTIVE', 'Start the game before advancing to the next question.');
    }
    if (nextPosition !== session.current_position + 1) {
      throw conflict('NOT_NEXT_QUESTION', `The next question is position ${session.current_position + 1}.`);
    }
    const totalQuestions = await questionRepository.countBySetId(session.question_set_id);
    if (nextPosition > totalQuestions) {
      throw conflict('NO_MORE_QUESTIONS', 'There are no more questions in this game.');
    }
    changes.current_position = nextPosition;
    changes.question_started_at = new Date();
  }

  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, get, changeStatus };
