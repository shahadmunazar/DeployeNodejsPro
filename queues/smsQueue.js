const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis({
  host: 'redis-19668.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 19668,
  username: 'default',
  password: '9Xjsid3RytGNGBedomu21iZ9v4iU0TgY',
  maxRetriesPerRequest: null,
});

const smsQueue = new Queue('sms-queue', { connection });

module.exports = smsQueue;
