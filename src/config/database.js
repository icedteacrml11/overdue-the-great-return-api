// Database settings for BOTH the running API and sequelize-cli.
// Values come from .env - nothing secret is written in this file.
const env = require('./env');

const settings = {
  ...(env.db.url
    ? { use_env_variable: 'DATABASE_URL' }
    : {
        username: env.db.user,
        password: env.db.password,
        database: env.db.name,
        host: env.db.host,
        port: env.db.port,
      }),
  dialect: 'postgres',
  logging: false,
  // Track seeders in a table, the same way migrations are tracked,
  // so running "db:seed:all" twice does not insert the data twice.
  seederStorage: 'sequelize',
  pool: { max: 10, min: 0, idle: 10000 },
  ...(env.db.ssl
    ? {
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false },
        },
      }
    : {}),
};

module.exports = {
  development: settings,
  test: settings,
  production: settings,
};
