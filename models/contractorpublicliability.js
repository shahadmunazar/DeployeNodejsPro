import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ContractorPublicLiability extends Model {
    static associate(models) {
      ContractorPublicLiability.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorPublicLiability.init({
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
      allowNull: true,
      unique: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverage_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    public_liabilty_file_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    modelName: 'ContractorPublicLiability',
    tableName: 'contractor_public_liability',
    timestamps: false, // You're using custom timestamps: created_at and updated_at
  });

  return ContractorPublicLiability;
};
