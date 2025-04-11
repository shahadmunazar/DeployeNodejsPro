module.exports = (sequelize, DataTypes) => {
    const Organization = sequelize.define('Organization', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      organization_name: {
        type: DataTypes.STRING,
        field: 'organization_name'
      },
      industryId: {
        type: DataTypes.INTEGER,
        field: 'industryId'
      },
      organization_address: {
        type: DataTypes.STRING,
        field: 'organization_address'
      },
      city: {
        type: DataTypes.STRING,
        field: 'city'
      },
      state: {
        type: DataTypes.STRING,
        field: 'state'
      },
      postal_code: {
        type: DataTypes.STRING,
        field: 'postal_code'
      },
      registration_id: {
        type: DataTypes.STRING,
        field: 'registration_id'
      },
      contact_phone_number: {
        type: DataTypes.STRING,
        field: 'contact_phone_number'
      },
      number_of_employees: {
        type: DataTypes.STRING,
        field: 'number_of_employees'
      },
      logo: {
        type: DataTypes.STRING,
        field: 'logo'
      },
      agreement_paper: {
        type: DataTypes.STRING,
        field: 'agreement_paper'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deletedAt'
      }
    }, {
      tableName: 'organizations', // 👈 use your actual table name here
      timestamps: true,
      paranoid: true // enables soft delete (if you're using `deletedAt`)
    });
  
    return Organization;
  };
  