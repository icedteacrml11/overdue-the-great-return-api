// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Week 11: load your models here, one line each, then add their associations.
// Example:
//   const User = require('./user')(sequelize, DataTypes);
//   const Player = require('./player')(sequelize, DataTypes);
//   User.hasMany(Player, { foreignKey: 'user_id' });
//   Player.belongsTo(User, { foreignKey: 'user_id' });

const User = require('./user')(sequelize, DataTypes);
const QuestionSet = require('./question-set')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);
const Choice = require('./choice')(sequelize, DataTypes);
const Session = require('./session')(sequelize, DataTypes);
const SessionPlayer = require('./session-player')(sequelize, DataTypes);
const PlayerAnswer = require('./player-answer')(sequelize, DataTypes);

// Associations matching your foreign keys
User.hasMany(QuestionSet, { foreignKey: 'host_id' });
QuestionSet.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

QuestionSet.hasMany(Question, { foreignKey: 'question_set_id', as: 'questions' });
Question.belongsTo(QuestionSet, { foreignKey: 'question_set_id' });

Question.hasMany(Choice, { foreignKey: 'question_id', as: 'choices' });
Choice.belongsTo(Question, { foreignKey: 'question_id' });

User.hasMany(Session, { foreignKey: 'host_id' });
Session.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

QuestionSet.hasMany(Session, { foreignKey: 'question_set_id' });
Session.belongsTo(QuestionSet, { foreignKey: 'question_set_id' });

Session.hasMany(SessionPlayer, { foreignKey: 'session_id', as: 'players' });
SessionPlayer.belongsTo(Session, { foreignKey: 'session_id' });

User.hasMany(SessionPlayer, { foreignKey: 'user_id' });
SessionPlayer.belongsTo(User, { foreignKey: 'user_id' });

Session.belongsTo(SessionPlayer, { foreignKey: 'winner_player_id', as: 'winner', constraints: false });

SessionPlayer.hasMany(PlayerAnswer, { foreignKey: 'session_player_id', as: 'answers' });
PlayerAnswer.belongsTo(SessionPlayer, { foreignKey: 'session_player_id' });

Question.hasMany(PlayerAnswer, { foreignKey: 'question_id' });
PlayerAnswer.belongsTo(Question, { foreignKey: 'question_id' });

Choice.hasMany(PlayerAnswer, { foreignKey: 'choice_id' });
PlayerAnswer.belongsTo(Choice, { foreignKey: 'choice_id' });

module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  User,
  QuestionSet,
  Question,
  Choice,
  Session,
  SessionPlayer,
  PlayerAnswer,
};
