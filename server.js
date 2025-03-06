const express = require("express");
const userRoutes = require("./routes/userRoutes"); // Import the routes
const LoginRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());


app.use("/api/auth", userRoutes);
app.use('/api',LoginRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
