const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const UserLogin = sequelize.define('user_logins', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    device: {
        type: DataTypes.STRING,
        allowNull: true
    },
    browser: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    login_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    logout_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});
User.hasMany(UserLogin, { foreignKey: 'user_id' });
UserLogin.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserLogin;
