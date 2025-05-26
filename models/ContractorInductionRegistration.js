"use strict";

module.exports = (sequelize, DataTypes) => {
  const ContractorInductionRegistration = sequelize.define(
    "ContractorInductionRegistration",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      email_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      mobile_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trade_type: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      email_otp_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      mobile_verified_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      mobile_otp_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invited_by_organization: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // police_check_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // covid_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // health_practitioner_registration_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // trade_qualification_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // flu_vaccination_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
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
      tableName: "contractor_induction_registration",
      timestamps: true,
      paranoid: true,
    }
  );

  // Define associations here if needed
  // ContractorInductionRegistration.associate = (models) => {
  //   ContractorInductionRegistration.belongsTo(models.Organization, {
  //     foreignKey: 'organization_id',
  //     as: 'organization',
  //   });
  // };

  return ContractorInductionRegistration;
};
