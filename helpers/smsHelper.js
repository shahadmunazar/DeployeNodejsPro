const smsQueue = require('../queues/smsQueue');
const sendRegistrationOtpSms = async (mobile, otp) => {
  try {
    await smsQueue.add('send-registration-otp', {
      mobile,
      otp
    });
    console.log(`📤 SMS job added for ${mobile}`);
  } catch (error) {
    console.error('❌ Failed to add SMS job:', error.message);
  }
};
module.exports = {
  sendRegistrationOtpSms,
};
