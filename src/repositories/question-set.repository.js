const { Op } = require('sequelize');
const { QuestionSet, Question, Choice } = require('../models');
const { toOffset } = require('../utils/paginate');

function findPage({ hostId, q, sort = 'id', order = 'asc', page = 1, limit = 10 } = {}) {
  const where = {};
  if (hostId !== undefined) where.host_id = hostId;
  if (q) where.title = { [Op.iLike]: `%${q}%` };

  return QuestionSet.findAndCountAll({
    where,
    order: [[sort, order.toUpperCase()]],
    ...toOffset({ page, limit }),
  });
}

function findAll() {
  return QuestionSet.findAll({ order: [['id', 'ASC']] });
}

function findAllByHost(hostId) {
  return QuestionSet.findAll({ where: { host_id: hostId }, order: [['id', 'ASC']] });
}

function findById(id, { includeQuestions = false } = {}) {
  if (!includeQuestions) {
    return QuestionSet.findByPk(id);
  }
  return QuestionSet.findByPk(id, {
    include: [
      {
        model: Question,
        as: 'questions',
        include: [{ model: Choice, as: 'choices' }],
      },
    ],
    order: [
      [{ model: Question, as: 'questions' }, 'position', 'ASC'],
      [{ model: Question, as: 'questions' }, { model: Choice, as: 'choices' }, 'position', 'ASC'],
    ],
  });
}

function create(data) {
  return QuestionSet.create(data);
}

function update(questionSet, changes) {
  return questionSet.update(changes);
}

function remove(questionSet) {
  return questionSet.destroy();
}

module.exports = { findPage, findAll, findAllByHost, findById, create, update, remove };
