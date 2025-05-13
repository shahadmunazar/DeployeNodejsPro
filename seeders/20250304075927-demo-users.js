const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("users", [
      {
        name: "Super Admin User",
        email: "shahadmunazar@gmail.com",
        username: "super_admin_user",
        password: await bcrypt.hash("Superadmin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Organization Admin User",
        email: "avdeshy213@gmail.com",
        username: "organization_admin_user",
        password: await bcrypt.hash("Organizationadmin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Contractor Admin User",
        email: "shahad1932@gmail.com",
        username: "contractor_admin_user",
        password: await bcrypt.hash("Contractoradmin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Admin User",
        email: "shahad1932a@gmail.com",
        username: "admin_user",
        password: await bcrypt.hash("admin123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Regular Manager",
        email: "manager@example.com",
        username: "manager_user",
        password: await bcrypt.hash("Manager123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Officer User",
        email: "officer@example.com",
        username: "officer_user",
        password: await bcrypt.hash("Officer231", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Technician User",
        email: "technician@example.com",
        username: "technician_user",
        password: await bcrypt.hash("tech@123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Compliance User",
        email: "compliance@example.com",
        username: "compliance_user",
        password: await bcrypt.hash("comp@123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
