const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { getCurrentUser } = require("../controllers/authController");
const {CreateRoles,GetAllRoles,GetRoleById} = require("../controllers/SuperAdmin/rolesController")
const router = express.Router();


/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */
const withAuthAndRole = (handler, role = "admin") => [authenticateUser, authorizeRoles(role), handler];


router.post('/rolse-create', ...withAuthAndRole(CreateRoles));
// GetAllRoles
router.get('/roles-get', ...withAuthAndRole(GetAllRoles));
//GetRoleById
router.get('/roles-details', ...withAuthAndRole(GetRoleById));


router.get("/admin", authenticateUser, authorizeRoles("admin"), (req, res) => {
    res.json({ message: "Welcome Admin!" });
});


router.get("/user", authenticateUser, getCurrentUser);


router.get("/user", authenticateUser, authorizeRoles("user"), (req, res) => {
    res.json({ message: "Welcome User!" });
});


router.get("/manager", authenticateUser, authorizeRoles("manager"), (req, res) => {
    res.json({ message: "Welcome Manager!" });
});

// ✅ Officer Route
router.get("/officer", authenticateUser, authorizeRoles("officer"), (req, res) => {
    res.json({ message: "Welcome Officer!" });
});

// ✅ Technician Route
router.get("/technician", authenticateUser, authorizeRoles("technician"), (req, res) => {
    res.json({ message: "Welcome Technician!" });
});

// ✅ Compliance Route
router.get("/compliance", authenticateUser, authorizeRoles("compliance"), (req, res) => {
    res.json({ message: "Welcome Compliance Officer!" });
});

module.exports = router;


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://visionlang:<db_password>@cluster0.u6nvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
