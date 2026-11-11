// A database rule was broken -> what the client should hear.
// The key is the constraint name from YOUR migration. PostgreSQL names a
// foreign key "<table>_<column>_fkey" when the migration does not name it.
// Write one entry for each constraint a client can hit. Example:
//
//   uq_player_nickname: {
//     status: 409,
//     code: 'NICKNAME_TAKEN',
//     message: 'That nickname is already used in this game.',
//   },
//
// A constraint that is not listed here still answers 409, with the code CONFLICT.
module.exports = {
  uq_player_nickname: {
    status: 409,
    code: 'NICKNAME_TAKEN',
    message: 'That nickname is already used in this game.',
  },
  uq_one_seat: {
    status: 409,
    code: 'ALREADY_JOINED',
    message: 'You already have a seat in this game.',
  },
  sessions_join_code_key: {
    status: 409,
    code: 'JOIN_CODE_TAKEN',
    message: 'That join code is already in use.',
  },
};
