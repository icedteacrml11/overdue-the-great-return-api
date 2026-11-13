const sessionService = require('./session.service');
const questionRepository = require('../repositories/question.repository');
const playerRepository = require('../repositories/player.repository');
const answerRepository = require('../repositories/answer.repository');
const { badRequest, forbidden, notFound, conflict } = require('../errors/app-error');

// Pure scoring function: base 1000, wrong or late -> 0, otherwise round(base * (1 - elapsed / (2 * limit))).
function pointsFor(question, isCorrect, elapsedMs) {
  const limitMs = ((question && question.time_limit_seconds) || 20) * 1000;
  if (!isCorrect || elapsedMs < 0 || elapsedMs > limitMs) return 0;
  const base = (question && question.points) || 1000;
  return Math.round(base * (1 - elapsedMs / (2 * limitMs)));
}

async function getCurrentQuestion(code) {
  const session = await sessionService.findOrFail(code);
  if (!['ACTIVE', 'RUNNING'].includes(session.status) || !session.current_position) {
    throw conflict('SESSION_NOT_ACTIVE', 'This game is not currently active.');
  }
  const question = await questionRepository.findBySetAndPosition(
    session.question_set_id,
    session.current_position
  );
  if (!question) {
    throw notFound('QUESTION_NOT_FOUND', 'No question found for the current position.');
  }
  return { session, question };
}

async function submitAnswer(code, { question_id: questionId, choice_id: choiceId }, user) {
  // 1. Game must be active/running (409)
  const session = await sessionService.findOrFail(code);
  if (!['ACTIVE', 'RUNNING'].includes(session.status) || !session.current_position) {
    throw conflict('SESSION_NOT_ACTIVE', 'This game is not currently active.');
  }

  // 2. Caller must be seated in this session (403)
  const seat = await playerRepository.findSeat(session.id, user.user_id);
  if (!seat) {
    throw forbidden('You are not seated in this game.');
  }

  // 3. Question must be the session's current question (409)
  const currentQuestion = await questionRepository.findBySetAndPosition(
    session.question_set_id,
    session.current_position
  );
  if (!currentQuestion || currentQuestion.id !== questionId) {
    throw conflict('NOT_CURRENT_QUESTION', 'You may only answer the current question.');
  }

  // 4. Choice must belong to the current question (400)
  const choice = (currentQuestion.choices || []).find((c) => c.id === choiceId);
  if (!choice) {
    throw badRequest('INVALID_CHOICE', 'That choice does not belong to this question.');
  }

  const startedAt = session.question_started_at
    ? new Date(session.question_started_at).getTime()
    : Date.now();
  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const isCorrect = Boolean(choice.is_correct);
  const points = pointsFor(currentQuestion, isCorrect, elapsedMs);
  const incrementDistance = isCorrect && seat.distance_progress < 10;

  const { answer, player } = await answerRepository.recordAnswer({
    seat,
    questionId: currentQuestion.id,
    choiceId: choice.id,
    isCorrect,
    points,
    elapsedMs,
    incrementDistance,
  });

  return {
    answer_id: answer.id,
    question_id: currentQuestion.id,
    choice_id: choice.id,
    is_correct: isCorrect,
    points_awarded: points,
    elapsed_ms: elapsedMs,
    total_score: player.score,
    distance_progress: player.distance_progress,
  };
}

// Ranks players by score descending; equal scores share a rank (1, 2, 2, 4).
function rankLeaderboard(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));
  let rank = 0;
  let previousScore = null;
  return sorted.map((player, index) => {
    if (player.score !== previousScore) {
      rank = index + 1;
      previousScore = player.score;
    }
    return {
      rank,
      player_id: player.id,
      user_id: player.user_id,
      nickname: player.nickname,
      score: player.score,
      distance_progress: player.distance_progress,
    };
  });
}

async function getLeaderboard(code, limit = 10) {
  const session = await sessionService.findOrFail(code);
  const players = await playerRepository.findAllBySession(session.id);
  const leaderboard = rankLeaderboard(players).slice(0, limit);
  return {
    session_code: session.join_code,
    status: session.status,
    leaderboard,
  };
}

module.exports = {
  pointsFor,
  rankLeaderboard,
  getCurrentQuestion,
  submitAnswer,
  getLeaderboard,
};

