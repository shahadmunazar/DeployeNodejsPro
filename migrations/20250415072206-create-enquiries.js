'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Enquiries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      // User Contact Info
      firstName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userRole: {
        type: Sequelize.STRING,
        allowNull: true // e.g., Admin, Technician, etc.
      },

      // Enquiry Core Info
      subject: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('New', 'In Progress', 'Resolved', 'Closed'),
        defaultValue: 'New'
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // Assigned Admin Info
      assignedAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      assignedAdminName: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // Optional fields for future
      attachments: {
        type: Sequelize.JSON, // Can store file info as an array of objects
        allowNull: true
      },
      activityLog: {
        type: Sequelize.JSON, // You can store logs like [{ date, action, adminId, name }]
        allowNull: true
      },

      // Timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Enquiries');
  }
};
