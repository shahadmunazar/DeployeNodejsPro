'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContractorInductionPdf extends Model {
    static associate(models) {
      ContractorInductionPdf.belongsTo(models.Organization, {
        foreignKey: 'organizations_id',
        as: 'organization',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ContractorInductionPdf.init({
    organizations_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pdf_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pdf_file: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pdf_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ContractorInductionPdf',
    tableName: 'contractor_induction_pdfs',
  });

  return ContractorInductionPdf;
};
