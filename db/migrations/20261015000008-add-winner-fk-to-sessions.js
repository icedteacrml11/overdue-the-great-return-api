module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('sessions', {
      fields: ['winner_player_id'], type: 'foreign key', name: 'fk_sessions_winner_player',
      references: { table: 'session_players', field: 'id' }, onDelete: 'SET NULL',
    });
  },
  async down(queryInterface) { await queryInterface.removeConstraint('sessions', 'fk_sessions_winner_player'); },
};
