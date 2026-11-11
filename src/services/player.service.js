const sessionService = require('./session.service');
const playerRepository = require('../repositories/player.repository');
const gameInfo = require('../config/game-info');
const { constraintOf } = require('../errors/db-errors');
const { conflict } = require('../errors/app-error');

async function join(code, nickname, user) {
  const session = await sessionService.findOrFail(code);

  // Rejoin: this account already has a seat here. Same row, same score.
  const seat = await playerRepository.findSeat(session.id, user.user_id);
  if (seat) {
    return { session, player: seat, created: false };
  }

  // New seat: only while the game is still in the lobby, and only if there is room.
  if (session.status === 'FINISHED') throw conflict('SESSION_ENDED', 'This game has ended.');
  if (session.status !== 'LOBBY') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }
  const seatsTaken = await playerRepository.countBySession(session.id);
  if (seatsTaken >= gameInfo.max_players) throw conflict('SESSION_FULL', 'This game is full.');

  try {
    const player = await playerRepository.create({
      session_id: session.id,
      user_id: user.user_id,
      nickname,
    });
    return { session, player, created: true };
  } catch (error) {
    // The same account sent two join requests at the same instant, and the other one won.
    // UNIQUE (session_id, user_id) stopped a second seat. Return the seat that exists.
    if (constraintOf(error) === 'uq_one_seat') {
      const existing = await playerRepository.findSeat(session.id, user.user_id);
      return { session, player: existing, created: false };
    }
    throw error; // a taken nickname reaches the error handler and answers 409 (Step 6)
  }
}

async function list(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.id);
}

module.exports = { join, list };

