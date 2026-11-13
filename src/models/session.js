module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Session',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      join_code: { type: DataTypes.CHAR(6), allowNull: false, unique: true },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
      question_set_id: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'LOBBY' },
      current_position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      question_started_at: { type: DataTypes.DATE, allowNull: true },
      winner_player_id: { type: DataTypes.INTEGER, allowNull: true },
      started_at: { type: DataTypes.DATE, allowNull: true },
      ended_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'sessions', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );