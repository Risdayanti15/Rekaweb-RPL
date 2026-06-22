'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Groups', 'nama', { type: Sequelize.STRING });
    await queryInterface.addColumn('Groups', 'deskripsi', { type: Sequelize.STRING });
    await queryInterface.addColumn('Groups', 'matkul', { type: Sequelize.STRING });
    await queryInterface.addColumn('Groups', 'anggota', { type: Sequelize.STRING });
    await queryInterface.addColumn('Groups', 'status', { type: Sequelize.STRING });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Groups', 'nama');
    await queryInterface.removeColumn('Groups', 'deskripsi');
    await queryInterface.removeColumn('Groups', 'matkul');
    await queryInterface.removeColumn('Groups', 'anggota');
    await queryInterface.removeColumn('Groups', 'status');
  }
};