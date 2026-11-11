const { SessionPlayer } = require('../models');

// The seat of one account in one session, or null. This one query is the rejoin rule.
function findSeat(sessionId, userId) {
  return SessionPlayer.findOne({ where: { session_id: sessionId, user_id: userId } });
}

function countBySession(sessionId) {
  return SessionPlayer.count({ where: { session_id: sessionId } });
}

function findAllBySession(sessionId) {
  return SessionPlayer.findAll({
    where: { session_id: sessionId },
    order: [['score', 'DESC'], ['nickname', 'ASC']],
  });
}

function create(data) {
  return SessionPlayer.create(data);
}

module.exports = { findSeat, countBySession, findAllBySession, create };

