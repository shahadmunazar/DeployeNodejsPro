module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('user_logins', {
          id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
          },
          user_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                  model: 'users',
                  key: 'id'
              },
              onDelete: 'CASCADE'
          },
          ip_address: {
              type: Sequelize.STRING,
              allowNull: true
          },
          city: {
              type: Sequelize.STRING,
              allowNull: true
          },
          country: {
              type: Sequelize.STRING,
              allowNull: true
          },
          device: {
              type: Sequelize.STRING,
              allowNull: true
          },
          browser: {
              type: Sequelize.STRING,
              allowNull: true
          },
          user_agent: {
              type: Sequelize.TEXT,
              allowNull: true
          },
          login_at: {
              type: Sequelize.DATE,
              defaultValue: Sequelize.NOW
          },
          logout_at: {  // ✅ New field to track logout time
            type: Sequelize.DATE,
            allowNull: true, // Initially null until user logs out
        },
        createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW
          },
          updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW
          }
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('user_logins');
  }
};
