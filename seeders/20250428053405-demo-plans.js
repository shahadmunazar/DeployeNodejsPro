'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert data into the 'plans' table
    await queryInterface.bulkInsert('plans', [
      {
        name: "Premium Plan",
        description: "Best for large organizations needing full feature access including AI insights.",
        tier: "Premium",
        features: JSON.stringify([
          "Asset Management",
          "Maintenance Management",
          "Contractor Management",
          "AI-Driven Reporting & Analytics"
        ]),
        asset_limit: null,
        user_limit: 100,
        price_monthly: 99.99,
        price_yearly: 999.99,
        price_custom: null,
        billing_cycle: "monthly",
        status: true,
        additional_info: "Advanced AI features for insights and reporting.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Intermediate Plan",
        description: "For medium-sized organizations with most essential features.",
        tier: "Intermediate",
        features: JSON.stringify([
          "Asset Management",
          "Contractor Management",
          "Maintenance Management"
        ]),
        asset_limit: 500,
        user_limit: 50,
        price_monthly: 49.99,
        price_yearly: 499.99,
        price_custom: null,
        billing_cycle: "monthly",
        status: true,
        additional_info: "Suitable for businesses looking for core management tools.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Basic Plan",
        description: "Perfect for small businesses with basic management features.",
        tier: "Basic",
        features: JSON.stringify([
          "Contractor Management"
        ]),
        asset_limit: 100,
        user_limit: 20,
        price_monthly: 19.99,
        price_yearly: 199.99,
        price_custom: null,
        billing_cycle: "monthly",
        status: true,
        additional_info: "A cost-effective solution for small businesses.",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove data from the 'plans' table (in case we need to rollback)
    await queryInterface.bulkDelete('plans', null, {});
  }
};
