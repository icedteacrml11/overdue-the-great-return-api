const env = require('../config/env');
const password = require('../security/password');
const token = require('../security/token');
const userRepository = require('../repositories/user.repository');
const { unauthorized, notFound, conflict } = require('../errors/app-error');

async function register(data) {
  const passwordHash = await password.hash(data.password);
  const created = await userRepository.create({
    school_id: data.school_id,
    full_name: data.full_name,
    email: data.email,
    role: 'PLAYER',
    password_hash: passwordHash,
  });
  return userRepository.findById(created.user_id);
}

async function login({ school_id, password: plainPassword }) {
  const account = await userRepository.findForLogin(school_id);
  const ok = await password.matches(plainPassword, account && account.password_hash);
  if (!ok) {
    throw unauthorized('Invalid school ID or password.', 'INVALID_CREDENTIALS');
  }
  return {
    token: token.issue(account),
    token_type: 'Bearer',
    expires_in: env.jwt.expiresIn,
    user: account,
  };
}

async function listUsers() {
  return userRepository.findAll();
}

async function changeRole(id, role, actor) {
  if (actor && Number(actor.user_id) === Number(id)) {
    throw conflict('SELF_ROLE_CHANGE', 'An admin cannot change their own role.');
  }
  const account = await userRepository.findById(id);
  if (!account) throw notFound('USER_NOT_FOUND', `No user with id ${id}.`);
  return userRepository.update(account, { role });
}

module.exports = { register, login, listUsers, changeRole };

