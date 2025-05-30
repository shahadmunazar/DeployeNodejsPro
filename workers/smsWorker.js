const { Worker } = require('bullmq');
const Redis = require('ioredis');
const request = require('request');
const connection = new Redis({
  host: 'redis-19668.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 19668,
  username: 'default',
  password: '9Xjsid3RytGNGBedomu21iZ9v4iU0TgY',
  maxRetriesPerRequest: null,
});
const worker = new Worker('sms-queue', async (job) => {
  const { mobile, otp } = job.data;
  console.log(`📥 Received SMS job for: ${mobile}, OTP: ${otp}`);
  const template = `Your registration OTP is ${otp} Use this code to complete your registration process. If you did not request this, please disregard this message. Vision Language Experts.`;
  console.log('📤 Sending SMS with message:', template);
  const options = {
    method: 'POST',
    url: 'https://www.smsalert.co.in/api/push.json',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      apikey: '67935f871f56a',
      sender: 'VLEPVT',
      mobileno: mobile,
      text: template
    }
  };
  request(options, function (error, response, body) {
    if (error) {
      console.error(`❌ SMS failed for ${mobile}:`, error.message);
    } else {
      console.log(`📲 SMS response for ${mobile}:`, body);
    }
  });
}, { connection });
worker.on('completed', (job) => {
  console.log(`✅ SMS Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`❌ SMS Job ${job.id} failed: ${err.message}`);
});
