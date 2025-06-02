require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed
const JobModel = require('../models/job');       // Adjust path as needed
const nodemailer = require('nodemailer');

// Initialize Job model
const Job = JobModel(sequelize, DataTypes);
console.log("Job model initialized");

async function processEmailJobs() {
  let job; // Declare here to access in catch block
  try {
    job = await Job.findOne({
      where: { status: 'pending' },
      order: [['createdAt', 'ASC']],
    });

    if (!job) {
      console.log('⏳ No pending email jobs');
      return;
    }

    const { type: jobName, payload } = job;

    let emailData;
    // Parse payload if it's a string
    try {
      emailData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (parseError) {
      console.error('Failed to parse job payload JSON:', parseError.message);
      await job.update({ status: 'failed' });
      return;
    }

    
    // switch (jobName) {
    //   case 'send-otp':
    //     break;
    //   default:
    //     console.error('Unknown job type:', jobName);
    //     await job.update({ status: 'failed' });
    //     return;
    // }
    if (!emailData.to) {
      throw new Error('No recipients defined in email data');
    }
    await job.update({ status: 'processing', attempts: job.attempts + 1 });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Konnect Verification" <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });
    await job.update({ status: 'done' });
    console.log(`✅ Email sent to ${emailData.to}`);
  } catch (err) {
    console.error('💥 Error processing email job:', err.message);
    if (job) {
      await job.update({ status: 'failed' });
    }
  }
}
setInterval(processEmailJobs, 5000);
module.exports = { processEmailJobs };
