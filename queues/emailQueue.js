const { Queue } = require('bullmq');
const Redis = require('ioredis');

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


// redis-cli -u redis://default:9Xjsid3RytGNGBedomu21iZ9v4iU0TgY@redis-19668.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:19668
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
