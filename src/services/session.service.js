const sessionRepository = require('../repositories/session.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const { constraintOf } = require('../errors/db-errors');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Rule: which status may follow which.
const NEXT_STATUS = {
  LOBBY: ['ACTIVE', 'FINISHED'],
  ACTIVE: ['FINISHED'],
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

  // A random code can already be in use. The UNIQUE rule on join_code tells us, and we try again.
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

async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id && user.role !== 'ADMIN') {
    throw forbidden('This game belongs to another host.');
  }
  if (!NEXT_STATUS[session.status].includes(status)) {
    throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot become ${status}.`);
  }
  const changes = { status };
  if (status === 'ACTIVE') changes.started_at = new Date();
  if (status === 'FINISHED') changes.ended_at = new Date();
  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, get, changeStatus };
