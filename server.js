const express = require("express");
const userRoutes = require("./routes/userRoutes"); // Import the routes
const LoginRoutes = require("./routes/authRoutes");
const cors = require("cors"); // Import cors

const app = express();
app.use(cors({
    origin: "*", 
    methods: "GET, POST, PUT, DELETE, OPTIONS", // Allows all common methods
    allowedHeaders: "*",
}));


app.use(express.json());


app.use(cors());

app.use("/api/auth", userRoutes);
app.use('/api',LoginRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
