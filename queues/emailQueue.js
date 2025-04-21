const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const connection = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Create and export the queue
const emailQueue = new Queue('email-queue', { connection });

module.exports = emailQueue;


// Withe new Redis with live server
// 
// require('dotenv').config(); // Load .env first
// const { Queue } = require('bullmq');
// const Redis = require('ioredis');

// // Use Redis URL from environment variable
// const connection = new Redis(process.env.REDIS_URL);

// // Create BullMQ queue
// const emailQueue = new Queue('email-queue', { connection });

// module.exports = emailQueue;
