'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contractor_registration', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      invited_organization_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      abn_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contractor_company_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contractor_trading_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      company_structure: {
        type: Sequelize.ENUM('Sole-Trader', '2-10 Employees', '11-50 Employees', '51-100 Employees', 'Over 100 Employees'),
        allowNull:true,
      },
      company_representative_first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      company_representative_last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      position_at_company: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      suburb: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contractor_phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      service_to_be_provided: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      covered_amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      have_professional_indemnity_insurance: {
        type: Sequelize.ENUM('Yes', 'No','N/A'),
        allowNull: true,
      },
     
      is_staff_member_nominated: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      provide_name_position_mobile_no: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      are_employees_provided_with_health_safety: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      are_employees_appropriately_licensed_qualified_safety: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      are_employees_confirmed_as_competent_to_undertake_work: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_all_sub_contractor_qualified_to_work: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_all_sub_contractor_required_insurance_public_liability: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      have_you_identified_all_health_safety_legislation: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_emergency_response: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_procedures_to_notify_the_applicable: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_you_have_SWMS_JSAS_or_safe_work: {
        type: Sequelize.ENUM('Yes', 'No', 'N/A'),
        allowNull: true,
      },
      do_your_workers_conduct_on_site_review: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_regularly_monitor_compliance: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      do_you_have_procedures_circumstances: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      have_you_been_prosecuted_health_regulator: {
        type: Sequelize.ENUM('Yes', 'No'),
        allowNull: true,
      },
      submission_status: {
        type: Sequelize.ENUM('confirm_submit', 'let_me_check', 'i_do_it_later', 'save_and_come_back_later','approved','rejected','save','pause','resubmission'),
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contractor_registration');
  },
};