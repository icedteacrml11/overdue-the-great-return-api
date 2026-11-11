const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

// The player list shows nicknames and scores only. Never the school ID, full name, or email.
function toJson(player) {
  return {
    nickname: player.nickname,
    score: player.score,
    distance_progress: player.distance_progress,
  };
}

async function join(req, res) {
  const { code, nickname } = matchedData(req);
  const { session, player, created } = await playerService.join(code, nickname, req.user);

  // 201 Created for a new seat, 200 OK when the account already had one (rejoin).
  res.status(created ? 201 : 200).json({
    player_id: player.id,
    nickname: player.nickname,
    score: player.score,
    distance_progress: player.distance_progress,
    rejoined: !created,
    session: {
      code: session.join_code,
      status: session.status,
    },
  });
}

async function list(req, res) {
  const { code } = matchedData(req);
  const players = await playerService.list(code);
  res.status(200).json(players.map(toJson));
}

module.exports = { join, list };

