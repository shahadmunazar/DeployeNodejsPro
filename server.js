const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { initSocket } = require("./controllers/socket");
const http = require("http");
const LoginRoutes = require("./routes/authRoutes");
const app = express();
app.use(cors({
    origin: "*", 
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "*",
}));
const server = http.createServer(app);
const io = initSocket(server); 
app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api", LoginRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
