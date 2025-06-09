"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContractorDocument = sequelize.define(
    "ContractorDocument",
    {
      contractor_reg_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "contractor_induction_registration",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      document_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "trade_type_select_documents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      document_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      document_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uploadedDocumentsType: {
        type: DataTypes.ENUM("mandatory", "optional"),
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
      file_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uploaded: {
        type: DataTypes.ENUM("not_select", "upload", "uploaded"),
        allowNull: false,
        defaultValue: "not_select",
      },
       approved_status: {
              type: DataTypes.ENUM('approved', 'not_approved', 'pending'),
              allowNull: true,
              defaultValue: 'pending',
            },
            seen_status: {
              type: DataTypes.ENUM('seen', 'not_seen', 'pending'),
              allowNull: true,
              defaultValue: 'pending',
            },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "contractor_documents",
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