'use strict';
module.exports = (sequelize, DataTypes) => {
  const ContractorDocument = sequelize.define(
    'ContractorDocument',
    {
      contractor_reg_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'contractor_induction_registration', // Name of the table being referenced
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      document_type: {
        type: DataTypes.ENUM(
          'police_check',
          'covid',
          'health_practitioner_registration',
          'trade_qualification',
          'flu_vaccination'
        ),
        allowNull: true,
      },
      reference_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'contractor_documents',
      timestamps: true,
      paranoid: true,
    }
  );
  ContractorDocument.associate = (models) => {
    ContractorDocument.belongsTo(models.ContractorInductionRegistration, {
      foreignKey: 'contractor_reg_id',
      as: 'contractor',
    });
  };
  return ContractorDocument;
};
