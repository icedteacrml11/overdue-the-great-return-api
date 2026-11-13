const { matchedData } = require('express-validator');
const authService = require('../services/auth.service');

function toUserJson(user) {
  return {
    user_id: user.user_id,
    school_id: user.school_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
}

async function register(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const user = await authService.register(data);
  res.status(201).json({ user: toUserJson(user) });
}

async function login(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const result = await authService.login(data);
  res.status(200).json({
    token: result.token,
    token_type: result.token_type,
    expires_in: result.expires_in,
    user: toUserJson(result.user),
  });
}

async function me(req, res) {
  res.status(200).json({ user: toUserJson(req.account) });
}

async function listUsers(req, res) {
  const users = await authService.listUsers();
  res.status(200).json({ users: users.map(toUserJson) });
}

async function changeRole(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const { role } = matchedData(req, { locations: ['body'] });
  const user = await authService.changeRole(id, role, req.user);
  res.status(200).json({ user: toUserJson(user) });
}

module.exports = { register, login, me, listUsers, changeRole };

