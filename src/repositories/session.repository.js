const { Session } = require('../models');

function findByCode(joinCode) {
  return Session.findOne({ where: { join_code: joinCode } });
}

function create(data) {
  return Session.create(data);
}

function update(session, changes) {
  return session.update(changes);
}

function countByQuestionSet(questionSetId) {
  return Session.count({ where: { question_set_id: questionSetId } });
}

module.exports = { findByCode, create, update, countByQuestionSet };

