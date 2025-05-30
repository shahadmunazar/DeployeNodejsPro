module.exports = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define('ActivityLog', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enquiryId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Enquiries',
          key: 'id',
        },
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subAdminName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    }, {
      paranoid: true, // Enable soft delete
      deletedAt: 'deletedAt',
    });
  
    ActivityLog.associate = function (models) {
      // Many-to-one relationship: ActivityLog belongs to Enquiry
      ActivityLog.belongsTo(models.Enquiry, { foreignKey: 'enquiryId' });
    };
  
    return ActivityLog;
  };
  