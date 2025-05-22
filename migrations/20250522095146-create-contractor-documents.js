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
          model: 'contractor_induction_registration', // Change if your contractor table is named differently
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      document_type: {
        type: Sequelize.ENUM(
          'police_check',
          'covid',
          'health_practitioner_registration',
          'trade_qualification',
          'flu_vaccination'
        ),
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contractor_documents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contractor_documents_document_type";');
  }
};
