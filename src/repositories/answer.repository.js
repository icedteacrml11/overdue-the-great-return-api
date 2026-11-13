const { sequelize, PlayerAnswer } = require('../models');

async function recordAnswer({ seat, questionId, choiceId, isCorrect, points, elapsedMs, incrementDistance }) {
  return sequelize.transaction(async (t) => {
    const answer = await PlayerAnswer.create(
      {
        session_player_id: seat.id,
        question_id: questionId,
        choice_id: choiceId,
        is_correct: isCorrect,
        points_awarded: points,
        elapsed_ms: elapsedMs,
        answered_at: new Date(),
      },
      { transaction: t }
    );

    if (points > 0) {
      await seat.increment('score', { by: points, transaction: t });
    }
    if (incrementDistance) {
      await seat.increment('distance_progress', { by: 1, transaction: t });
    }
    await seat.reload({ transaction: t });

    return { answer, player: seat };
  });
}

function countByPlayer(sessionPlayerId) {
  return PlayerAnswer.count({ where: { session_player_id: sessionPlayerId } });
}

module.exports = { recordAnswer, countByPlayer };

