jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/security/password');
jest.mock('../../src/security/token');

const userRepository = require('../../src/repositories/user.repository');
const password = require('../../src/security/password');
const authService = require('../../src/services/auth.service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth.service unit tests', () => {
  test('login throws the exact same 401 INVALID_CREDENTIALS error for wrong password and unknown school ID', async () => {
    userRepository.findForLogin.mockResolvedValueOnce({
      user_id: 1,
      school_id: '2024-0001',
      password_hash: '$2b$10$hash',
    });
    password.matches.mockResolvedValueOnce(false);

    let wrongPassError;
    try {
      await authService.login({ school_id: '2024-0001', password: 'WrongPassword1' });
    } catch (err) {
      wrongPassError = err;
    }

    userRepository.findForLogin.mockResolvedValueOnce(null);
    password.matches.mockResolvedValueOnce(false);

    let unknownIdError;
    try {
      await authService.login({ school_id: '2099-9999', password: 'WrongPassword1' });
    } catch (err) {
      unknownIdError = err;
    }

    expect(wrongPassError).toBeDefined();
    expect(unknownIdError).toBeDefined();
    expect(wrongPassError.status).toBe(401);
    expect(wrongPassError.code).toBe('INVALID_CREDENTIALS');
    expect(unknownIdError.status).toBe(wrongPassError.status);
    expect(unknownIdError.code).toBe(wrongPassError.code);
    expect(unknownIdError.message).toBe(wrongPassError.message);
  });

  test('changeRole refuses an admin changing their own role with 409 SELF_ROLE_CHANGE', async () => {
    await expect(
      authService.changeRole(6, 'PLAYER', { user_id: 6, role: 'ADMIN' })
    ).rejects.toMatchObject({
      status: 409,
      code: 'SELF_ROLE_CHANGE',
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
