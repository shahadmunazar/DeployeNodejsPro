const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { initSocket } = require("./controllers/socket");
const http = require("http");
const cron = require('node-cron');
const sendPendingOnboardingEmails = require('./cron/sendOnboardingEmails');
const LoginRoutes = require("./routes/authRoutes");
const SuperAdminRoutes = require("./routes/SuperAdminRoutes");
const app = express();
app.use(cors({
    origin: "*", 
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "*",
}));

cron.schedule('* * * * *', async () => {
    console.log('🔁 Running onboarding email cron job...');
    await sendPendingOnboardingEmails();
  });
const server = http.createServer(app);
const io = initSocket(server); 
app.use(cors());
app.use(express.json());

app.use("/api/superadmin",SuperAdminRoutes);
app.use("/api/auth", userRoutes);
app.use("/api", LoginRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
