const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("Users", [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Regular Manager",
        email: "manager@example.com",
        password: await bcrypt.hash("Manager123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Officer User",
        email: "officer@example.com",
        password: await bcrypt.hash("Officer231", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Technician User",
        email: "technician@example.com",
        password: await bcrypt.hash("tech@123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Compliance User",
        email: "compliance@example.com",
        password: await bcrypt.hash("comp@123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
