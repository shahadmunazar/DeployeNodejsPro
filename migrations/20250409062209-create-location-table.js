'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assets', // Foreign key to the assets table
          key: 'id',
        },
        onDelete: 'CASCADE', // If the asset is deleted, the location record will also be deleted
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      building: {
        type: Sequelize.STRING(255),
        allowNull: true, // Building can be optional
      },
      floor: {
        type: Sequelize.STRING(255),
        allowNull: true, // Floor can be optional
      },
      room: {
        type: Sequelize.STRING(255),
        allowNull: true, // Room can be optional
      },
      level: {
        type: Sequelize.STRING(255),
        allowNull: true, // Level can be optional
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true, // Nullable to support soft delete (null means it's not deleted)
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('locations');
  }
};
