const express = require("express");
const cors = require("cors"); // Import cors
const userRoutes = require("./routes/userRoutes");
const LoginRoutes = require("./routes/authRoutes");
const cors = require("cors"); // Import cors

const app = express();
app.use(express.json());


app.use("/api/auth", userRoutes);
app.use("/api", LoginRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
