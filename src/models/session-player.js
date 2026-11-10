module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'SessionPlayer',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      nickname: { type: DataTypes.STRING(30), allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      distance_progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      question_started_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'session_players', timestamps: false }
  );