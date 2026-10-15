// Hub Contract rule 7. Queries finished games and player results for the Library Game Hub.
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT
      s.join_code AS session_code,
      s.started_at,
      s.ended_at,
      u.school_id,
      sp.nickname,
      sp.score,
      (sp.distance_progress >= 10 OR s.status = 'FINISHED') AS completed
    FROM sessions s
    JOIN session_players sp ON sp.session_id = s.id
    JOIN users u ON u.user_id = sp.user_id
    WHERE s.status = 'FINISHED'
      AND (CAST(:since AS timestamptz) IS NULL OR s.ended_at > CAST(:since AS timestamptz))
    ORDER BY s.ended_at ASC, sp.score DESC, sp.nickname ASC
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: { since: since ? since.toISOString() : null },
  });
}

module.exports = { findFinishedGamePlayers };
