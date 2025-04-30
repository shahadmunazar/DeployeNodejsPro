import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ContractorOrganizationSafetyManagement extends Model {
    static associate(models) {
      ContractorOrganizationSafetyManagement.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorOrganizationSafetyManagement.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    does_organization_safety_management_system_filename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    modelName: 'ContractorOrganizationSafetyManagement',
    tableName: 'contractor_organization_safety_management',
    timestamps: false,
  });

  return ContractorOrganizationSafetyManagement;
};
