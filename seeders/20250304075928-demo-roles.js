module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("Roles", [
      {name:"superadmin", createdAt: new Date(),updatedAt: new Date()},
      { name: "admin", createdAt: new Date(), updatedAt: new Date() },
      { name: "manager", createdAt: new Date(), updatedAt: new Date() },
      { name: "officer", createdAt: new Date(), updatedAt: new Date() },
      { name: "technician", createdAt: new Date(), updatedAt: new Date() },
      { name: "compliance", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("Roles", null, {});
  },
};
