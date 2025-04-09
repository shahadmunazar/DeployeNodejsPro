// cron/sendOnboardingEmails.js
const User = require('../models/user');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Role = require("../models/role");
const sendOnboardingEmail = require('../utils/sendOnboardingEmail'); // You'll define this function
const { Op } = require('sequelize');

const sendPendingOnboardingEmails = async () => {
  try {
    const users = await User.findAll({
      where: {
        onboarding_email_sent: true,
      },
      include: [
        {
          model: Role,
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    for (const user of users) {
      const tempPassword = generateTempPassword();
      const activationToken = generateActivationToken(user.email); // Custom token logic

      // Store hashed password and token expiration (24 hrs)
      await user.update({
        password: await bcrypt.hash(tempPassword, 10),
        activation_token: activationToken,
        activation_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // Send email
      const emailSent = await sendOnboardingEmail({
        email: user.email,
        name: user.name,
        tempPassword,
        activationLink: `https://naaticcl.visionlanguageexperts.in/user-login`,
      });

      if (emailSent) {
        await user.update({ onboarding_email_sent: true });
        console.log(`✅ Onboarding email sent to ${user.email}`);
      } else {
        console.warn(`⚠️ Failed to send email to ${user.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Error in onboarding cron job:', error);
  }
};

// Helper functions
function generateTempPassword(length = 10) {
  return Math.random().toString(36).slice(-length);
}

function generateActivationToken(email) {
  return require('crypto').createHash('sha256').update(email + Date.now()).digest('hex');
}

module.exports = sendPendingOnboardingEmails;
