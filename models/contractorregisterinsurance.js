import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ContractorRegisterInsurance extends Model {
    static associate(models) {
      ContractorRegisterInsurance.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorRegisterInsurance.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coverage_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    document_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'ContractorRegisterInsurance',
    tableName: 'contractor_register_insurance',
    timestamps: true,
    paranoid: true, // Enables soft deletes
  });

  return ContractorRegisterInsurance;
};
