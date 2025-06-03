const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("users", [
      {
        name: "Super Admin User",
        email: "devraj40u@gmail.com",
        username: "super_admin_user",
        password: await bcrypt.hash("Superadmin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
