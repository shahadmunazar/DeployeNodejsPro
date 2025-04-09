module.exports = (sequelize, DataTypes) => {
    const Location = sequelize.define('Location', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'assets', // This references the `Asset` model
          key: 'id', // This is the `id` field of the `Asset` model
        },
        onDelete: 'CASCADE', // When an asset is deleted, the related location will also be deleted
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      building: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      floor: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      room: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
      paranoid: true, // Enables soft deletion
      timestamps: true,
      tableName: 'locations',
      underscored: true,
    });
  
    // Define the relationship between Location and Asset
    Location.associate = function(models) {
      // A Location belongs to one Asset
      Location.belongsTo(models.Asset, {
        foreignKey: 'asset_id', // The foreign key that connects Location to Asset
        as: 'asset', // Alias for the relation
      });
    };
  
    return Location;
  };
  