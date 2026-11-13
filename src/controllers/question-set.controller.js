const { matchedData } = require('express-validator');
const questionSetService = require('../services/question-set.service');
const { envelope } = require('../utils/paginate');

function toChoiceJson(choice) {
  return {
    id: choice.id,
    question_id: choice.question_id,
    choice_text: choice.choice_text,
    position: choice.position,
    is_correct: choice.is_correct,
  };
}

function toQuestionJson(question) {
  return {
    id: question.id,
    question_set_id: question.question_set_id,
    question_type: question.question_type,
    prompt_text: question.prompt_text,
    position: question.position,
    time_limit_seconds: question.time_limit_seconds,
    choices: Array.isArray(question.choices) ? question.choices.map(toChoiceJson) : [],
  };
}

// What a client is allowed to see of a question set.
function toJson(questionSet) {
  const out = {
    id: questionSet.id,
    title: questionSet.title,
    host_id: questionSet.host_id,
    cover_url: questionSet.cover_url || null,
    created_at: questionSet.created_at,
  };
  if (Array.isArray(questionSet.questions)) {
    out.questions = questionSet.questions.map(toQuestionJson);
  }
  return out;
}

async function list(req, res) {
  const query = matchedData(req, { locations: ['query'] });
  const page = query.page || 1;
  const limit = query.limit || 10;
  const { rows, count } = await questionSetService.list({ ...query, page, limit }, req.user);
  res.status(200).json(envelope(rows.map(toJson), count, { page, limit }));
}

async function get(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const { include } = matchedData(req, { locations: ['query'] });
  const questionSet = await questionSetService.get(id, req.user, {
    includeQuestions: include === 'questions',
  });
  res.status(200).json(toJson(questionSet));
}

async function create(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const questionSet = await questionSetService.create(data, req.user);
  res.status(201).json(toJson(questionSet));
}

async function update(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const questionSet = await questionSetService.update(id, changes, req.user);
  res.status(200).json(toJson(questionSet));
}

async function remove(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  await questionSetService.remove(id, req.user);
  res.status(204).end();
}

async function uploadCover(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const coverUrl = `/uploads/covers/${req.file.filename}`;
  const questionSet = await questionSetService.updateCover(id, coverUrl, req.user);
  res.status(200).json(toJson(questionSet));
}

async function listQuestions(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const questions = await questionSetService.listQuestions(id, req.user);
  res.status(200).json(questions.map(toQuestionJson));
}

async function createQuestion(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const data = matchedData(req, { locations: ['body'] });
  const question = await questionSetService.createQuestion(id, data, req.user);
  res.status(201).json(toQuestionJson(question));
}

async function updateQuestion(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const question = await questionSetService.updateQuestion(id, questionId, changes, req.user);
  res.status(200).json(toQuestionJson(question));
}

async function removeQuestion(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  await questionSetService.removeQuestion(id, questionId, req.user);
  res.status(204).end();
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  uploadCover,
  listQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion,
};
