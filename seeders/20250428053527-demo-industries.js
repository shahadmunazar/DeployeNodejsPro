'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert data into the 'industries' table using queryInterface.bulkInsert
    await queryInterface.bulkInsert('industries', [
      {
        name: 'Technology',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Healthcare',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Finance',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Retail',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Education',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Manufacturing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Construction',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Transportation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Real Estate',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Energy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove all industries (in case we need to rollback)
    await queryInterface.bulkDelete('industries', null, {});
  }
};
