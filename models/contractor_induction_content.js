'use strict';

module.exports = (sequelize, DataTypes) => {
  const ContractorInductionContent = sequelize.define('ContractorInductionContent', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    contractor_register_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    html_content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
  }, {
    tableName: 'contractor_induction_content',
    timestamps: true,
    paranoid: true,  // enables soft delete using deletedAt
  });

//   ContractorInductionContent.associate = function(models) {
//     ContractorInductionContent.belongsTo(models.Orginaza, {
//       foreignKey: 'organizations',
//       as: 'contractorRegister',
//     });
//   };

  return ContractorInductionContent;
};
