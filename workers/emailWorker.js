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
});

const worker = new Worker('email-queue', async (job) => {
  const { to, subject, text, html } = job.data;
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  
    },
  });

  try {
    await transporter.sendMail({
      from: `"Konnect Verification Code" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Step Email sent to ${to}`);
  } catch (err) {
    console.error(` Failed to send email to ${to}: ${err.message}`);
    console.error('Full error:', err);
    throw err;
  }
}, { connection });


worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} failed: ${err.message}`);
});
