const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());

describe('Auth & Accounts HTTP API', () => {
  test('POST /auth/register creates a PLAYER even when role ADMIN is requested (201) and never exposes password_hash', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      school_id: '2026-9001',
      full_name: 'Test Reader One',
      email: 'test.reader9001@sorsu.edu.ph',
      password: 'Password123',
      role: 'ADMIN',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.school_id).toBe('2026-9001');
    expect(res.body.user.role).toBe('PLAYER');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  test('POST /auth/register answers 409 SCHOOL_ID_TAKEN on duplicate school_id', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      school_id: '2099-0001',
      full_name: 'Duplicate User',
      email: 'dup.user9001@sorsu.edu.ph',
      password: 'Password123',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SCHOOL_ID_TAKEN');
  });

  test('POST /auth/register answers 400 VALIDATION_FAILED on weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      school_id: '2026-9002',
      full_name: 'Weak Pass User',
      email: 'weak.user9002@sorsu.edu.ph',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  test('POST /auth/login returns identical 401 INVALID_CREDENTIALS for wrong password and unknown school_id', async () => {
    const wrongPass = await request(app)
      .post('/api/v1/auth/login')
      .send({ school_id: '2099-0001', password: 'WrongPassword999' });
    const unknownId = await request(app)
      .post('/api/v1/auth/login')
      .send({ school_id: '2099-9999', password: 'WrongPassword999' });

    expect(wrongPass.status).toBe(401);
    expect(unknownId.status).toBe(401);
    expect(wrongPass.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknownId.body.error).toEqual(wrongPass.body.error);
  });

  test('GET /auth/me answers 200 with valid Bearer token and 401 without or with tampered token', async () => {
    const hostAuth = await bearer('2099-0001');
    const okRes = await request(app).get('/api/v1/auth/me').set('Authorization', hostAuth);
    expect(okRes.status).toBe(200);
    expect(okRes.body.user.school_id).toBe('2099-0001');

    const noTokenRes = await request(app).get('/api/v1/auth/me');
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body.error.code).toBe('AUTH_REQUIRED');

    const tamperedRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `${hostAuth}tampered`);
    expect(tamperedRes.status).toBe(401);
    expect(tamperedRes.body.error.code).toBe('INVALID_TOKEN');
  });

  test('Admin routes: PLAYER gets 403 FORBIDDEN on GET /users; ADMIN gets 200 and 409 SELF_ROLE_CHANGE on own account', async () => {
    const playerAuth = await bearer('2099-1001');
    const adminAuth = await bearer('2099-0002');

    const forbiddenRes = await request(app).get('/api/v1/users').set('Authorization', playerAuth);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.error.code).toBe('FORBIDDEN');

    const listRes = await request(app).get('/api/v1/users').set('Authorization', adminAuth);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.users)).toBe(true);

    const adminUser = listRes.body.users.find((u) => u.school_id === '2099-0002');
    const playerUser = listRes.body.users.find((u) => u.school_id === '2099-1004');

    const promoteRes = await request(app)
      .patch(`/api/v1/users/${playerUser.user_id}/role`)
      .set('Authorization', adminAuth)
      .send({ role: 'HOST' });
    expect(promoteRes.status).toBe(200);
    expect(promoteRes.body.user.role).toBe('HOST');

    const selfChangeRes = await request(app)
      .patch(`/api/v1/users/${adminUser.user_id}/role`)
      .set('Authorization', adminAuth)
      .send({ role: 'PLAYER' });
    expect(selfChangeRes.status).toBe(409);
    expect(selfChangeRes.body.error.code).toBe('SELF_ROLE_CHANGE');
  });
});
