const { Worker } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Redis connection
// const connection = new Redis({
//   host: '127.0.0.1',
//   port: 6379,
//   maxRetriesPerRequest: null,
// });
const connection = new Redis({
  host: 'redis-19668.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 19668,
  username: 'default',
  password: '9Xjsid3RytGNGBedomu21iZ9v4iU0TgY',
  maxRetriesPerRequest: null,
  // tls: {}, // Required for Redis Cloud (SSL)
});

// Create a worker to process email jobs from the 'email-queue' queue
const worker = new Worker('email-queue', async (job) => {
  const { to, subject, text, html } = job.data;

  // Log credentials to ensure they are loaded
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // from .env
      pass: process.env.EMAIL_PASS,  // App password, not Gmail login password
    },
  });

  try {
    await transporter.sendMail({
      from: `"Node SaaS BackEnd" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Step Email sent to ${to}`);
  } catch (err) {
    console.error(` Failed to send email to ${to}: ${err.message}`);
    console.error('Full error:', err);  // Log the full error for debugging
    throw err; // Rethrow so the job is marked as failed
  }
}, { connection });

// Event listeners for job status
worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} failed: ${err.message}`);
});
