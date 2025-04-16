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
