// Loads .env once and fails fast when a required key is missing.
require('dotenv').config({ quiet: true });

const REQUIRED = [
  ...(process.env.DATABASE_URL ? [] : ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']),
  'HUB_API_KEY',
  'JWT_SECRET',
  'CORS_ORIGINS',
];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required .env keys: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in your own values.'
  );
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT) || 3001,
  hubApiKey: process.env.HUB_API_KEY,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
  db: {
    url: process.env.DATABASE_URL || null,
    ssl: process.env.DB_SSL === 'true',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: nodeEnv === 'test' ? `${process.env.DB_NAME}_test` : process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
