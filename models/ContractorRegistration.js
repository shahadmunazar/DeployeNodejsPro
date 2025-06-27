'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContractorRegistration extends Model {
    static associate(models) {
      // Relationship with Organization
      ContractorRegistration.belongsTo(models.Organization, {
        foreignKey: 'invited_organization_by',
        as: 'invitingOrganization',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      

      // Add relationship with ContractorRegisterInsurance
      ContractorRegistration.hasMany(models.ContractorRegisterInsurance, {
        foreignKey: 'contractor_id',
        as: 'insurance', // Alias to access insurance data
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });



      // Add relationship with ContractorPublicLiability
      ContractorRegistration.hasMany(models.ContractorPublicLiability, {
        foreignKey: 'contractor_id',
        as: 'publicLiabilities', // Alias to access public liabilities
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Add relationship with ContractorOrganizationSafetyManagement
      ContractorRegistration.hasMany(models.ContractorOrganizationSafetyManagement, {
        foreignKey: 'contractor_id',
        as: 'safetyManagement', // Alias to access safety management records
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorRegistration.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      invited_organization_by: DataTypes.INTEGER,
      abn_number: DataTypes.STRING,
      contractor_company_name: DataTypes.STRING,
      contractor_trading_name: DataTypes.STRING,
      company_structure: {
        type: DataTypes.ENUM('Sole-Trader', '2-10 Employees', '11-50 Employees', '51-100 Employees', 'Over 100 Employees'),
      },
      contractor_invitation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_representative_first_name: DataTypes.STRING,
      company_representative_last_name: DataTypes.STRING,
      position_at_company: DataTypes.STRING,
      address: DataTypes.STRING,
      street: DataTypes.STRING,
      suburb: DataTypes.STRING,
      state: DataTypes.STRING,
      postal_code:DataTypes.STRING,
      contractor_phone_number: DataTypes.STRING,
      service_to_be_provided: DataTypes.TEXT,
      covered_amount: DataTypes.INTEGER,
      have_professional_indemnity_insurance: {
        type: DataTypes.ENUM('Yes', 'No','N/A'),
        allowNull: true,
          },
      is_staff_member_nominated: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      provide_name_position_mobile_no: DataTypes.JSON,
      are_employees_provided_with_health_safety: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      are_employees_appropriately_licensed_qualified_safety: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      are_employees_confirmed_as_competent_to_undertake_work: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_all_sub_contractor_qualified_to_work: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_all_sub_contractor_required_insurance_public_liability: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      have_you_identified_all_health_safety_legislation: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_emergency_response: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_procedures_to_notify_the_applicable: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_SWMS_JSAS_or_safe_work: {
        type: DataTypes.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_your_workers_conduct_on_site_review: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_regularly_monitor_compliance: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_have_procedures_circumstances: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      have_you_been_prosecuted_health_regulator: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
      },
      submission_status: {
        type: DataTypes.ENUM('confirm_submit', 'let_me_check', 'i_do_it_later', 'save_and_come_back_later','approved','rejected','save','pause','resubmission'),
        allowNull: true,
      },
      status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      employee_insure_doc_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      public_liability_doc_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      organization_safety_management_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      comments_history: {
        type: DataTypes.JSON,
        allowNull: true,
      }, 
      compliance_status: {
        type: DataTypes.ENUM('pending', 'compliance', 'non-compliance'),
        allowNull: true,
        defaultValue: 'pending', // Default value set to 'pending'
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
      },
    },
    {
      sequelize,
      modelName: 'ContractorRegistration',
      tableName: 'contractor_registration',
      timestamps: true,
      paranoid: true,
    }
  );

  return ContractorRegistration;
};
