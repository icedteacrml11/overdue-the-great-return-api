const questionSetRepository = require('../repositories/question-set.repository');
const questionRepository = require('../repositories/question.repository');
const sessionRepository = require('../repositories/session.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');

async function findOrFail(id, options = {}) {
  const questionSet = await questionSetRepository.findById(id, options);
  if (!questionSet) throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${id}.`);
  return questionSet;
}

function isOwner(questionSet, user) {
  return questionSet.host_id === user.user_id || user.role === 'ADMIN';
}

async function ensureMutable(questionSetId) {
  const sessionCount = await sessionRepository.countByQuestionSet(questionSetId);
  if (sessionCount > 0) {
    throw conflict('QUESTION_SET_IN_USE', 'This question set was used in a game and is now frozen.');
  }
}

// Rule: a host sees their own sets. An admin sees every set.
function list(query, user) {
  const hostId = user.role === 'ADMIN' ? undefined : user.user_id;
  return questionSetRepository.findPage({ ...query, hostId });
}

// Rule: a set can be read by its owner or by an admin.
async function get(id, user, { includeQuestions = false } = {}) {
  const questionSet = await findOrFail(id, { includeQuestions });
  if (!isOwner(questionSet, user)) {
    throw forbidden('This question set belongs to another host.');
  }
  return questionSet;
}

// Rule: the owner is the caller. A client can never choose host_id.
function create(data, user) {
  return questionSetRepository.create({ ...data, host_id: user.user_id });
}

// Rule: only the owner (or an admin) may change or delete a set; used sets are frozen.
async function update(id, changes, user) {
  const questionSet = await findOrFail(id);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  await ensureMutable(id);
  return questionSetRepository.update(questionSet, changes);
}

async function remove(id, user) {
  const questionSet = await findOrFail(id);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  await questionSetRepository.remove(questionSet);
}

async function updateCover(id, coverUrl, user) {
  const questionSet = await findOrFail(id);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  return questionSetRepository.update(questionSet, { cover_url: coverUrl });
}

async function listQuestions(setId, user) {
  const questionSet = await findOrFail(setId);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  return questionRepository.findAllBySetId(setId);
}

async function createQuestion(setId, data, user) {
  const questionSet = await findOrFail(setId);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  await ensureMutable(setId);
  return questionRepository.createWithChoices(setId, data, data.choices);
}

async function updateQuestion(setId, questionId, changes, user) {
  const questionSet = await findOrFail(setId);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  await ensureMutable(setId);

  const question = await questionRepository.findById(questionId);
  if (!question || question.question_set_id !== setId) {
    throw notFound('QUESTION_NOT_FOUND', `No question with id ${questionId} in question set ${setId}.`);
  }
  return questionRepository.updateWithChoices(question, changes);
}

async function removeQuestion(setId, questionId, user) {
  const questionSet = await findOrFail(setId);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  await ensureMutable(setId);

  const question = await questionRepository.findById(questionId);
  if (!question || question.question_set_id !== setId) {
    throw notFound('QUESTION_NOT_FOUND', `No question with id ${questionId} in question set ${setId}.`);
  }
  await questionRepository.remove(question);
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  updateCover,
  listQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
};
