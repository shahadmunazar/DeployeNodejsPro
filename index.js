const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { initSocket } = require("./controllers/socket");
const http = require("http");
const bodyParser = require('body-parser');
const cron = require('node-cron');
const sendPendingOnboardingEmails = require('./cron/sendOnboardingEmails');
const sendContractorRegistrationEmail = require('./cron/sendContractorRegistrationEmails');
const LoginRoutes = require("./routes/authRoutes");
const path = require('path');
const SuperAdminRoutes = require("./routes/SuperAdminRoutes");
const ContractorRoutes  = require("./routes/contractorAdminRoutes");
const OrginazationRoutes = require("./routes/orginazationAdminRoutes");
const app = express();
app.use(cors({
    origin: "*", 
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "*",
}));


app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


app.use()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


cron.schedule('* * * * *', async () => {
    console.log('🔁 Running onboarding email cron job...');
    await sendPendingOnboardingEmails();
    // await sendContractorRegistrationEmail();
  });
const server = http.createServer(app);
const io = initSocket(server); 
app.use(cors());
app.use(express.json());

app.use("/api/superadmin",SuperAdminRoutes);
app.use("/api/auth", userRoutes);
app.use("/api", LoginRoutes);
app.use("/api/contractor", ContractorRoutes);
app.use("/api/orginazation",OrginazationRoutes)
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
