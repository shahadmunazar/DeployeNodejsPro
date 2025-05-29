'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contractor_documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contractor_reg_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contractor_induction_registration',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      document_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'trade_type_select_documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      document_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      document_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reference_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded: {
        type: Sequelize.ENUM('not_select', 'upload', 'uploaded'),
        allowNull: false,
        defaultValue: 'not_select',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('contractor_documents', ['contractor_reg_id']);
    await queryInterface.addIndex('contractor_documents', ['document_type_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contractor_documents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contractor_documents_uploaded";');
  }
};
