module.exports = {
  async up(queryInterface) {
    // Fetch user and role IDs dynamically
    const users = await queryInterface.sequelize.query(`SELECT id, email FROM users`);
    const roles = await queryInterface.sequelize.query(`SELECT id, name FROM Roles`);

    // Convert query result into an easy-to-access object
    const userMap = Object.fromEntries(users[0].map(user => [user.email, user.id]));
    const roleMap = Object.fromEntries(roles[0].map(role => [role.name, role.id]));

    return queryInterface.bulkInsert("UserRoles", [
      {userId: userMap['shahadmunazar@gmail.com'],roleId: roleMap['superadmin'],createdAt: new Date(), updatedAt: new Date()},
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("UserRoles", null, {});
  },
};
