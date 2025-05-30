'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   up : async(queryInterface, Sequelize) => {

    await queryInterface.addColumn('Purchases', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
   
    
  },

   down: async (queryInterface, Sequelize) =>{
    await queryInterface.removeColumn('Purchases', 'status');
  
  }
};
