module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'PlayerAnswer',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_player_id: { type: DataTypes.INTEGER, allowNull: false },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      choice_id: { type: DataTypes.INTEGER, allowNull: true },
      is_correct: { type: DataTypes.BOOLEAN, allowNull: false },
      points_awarded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      elapsed_ms: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      answered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'player_answers', timestamps: false }
  );

