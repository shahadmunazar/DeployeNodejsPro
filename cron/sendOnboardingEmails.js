// cron/sendOnboardingEmails.js

const User = require('../models/user');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Role = require("../models/role");
const sendOnboardingEmail = require('../utils/sendOnboardingEmail');
const PasswordChangesEmail = require('../utils/PasswordChangesEmail');
const { Op } = require('sequelize');

const sendPendingOnboardingEmails = async () => {
  try {
    console.log("🔁 Running onboarding email cron job...");

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { onboarding_email_sent: false },
          { passwordChanged: true }
        ]
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
      // Skip users without an email
      if (!user.email) {
        console.warn(`⚠️ Skipping user (ID: ${user.id}) - email is missing.`);
        continue;
      }

      const tempPassword = generateTempPassword();
      const activationToken = generateActivationToken(user.email);

      // If onboarding email has not been sent
      if (!user.onboarding_email_sent) {
        await user.update({
          password: await bcrypt.hash(tempPassword, 10),
          activation_token: activationToken,
          activation_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

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
          console.warn(`⚠️ Failed to send onboarding email to ${user.email}`);
        }

      } else if (user.passwordChanged === true) {
        const emailSent = await PasswordChangesEmail({
          email: user.email,
          name: user.name,
          type: 'passwordChanged'
        });

        if (emailSent) {
          await user.update({ passwordChanged: false });
          console.log(`✅ Password change email sent to ${user.email}`);
        } else {
          console.warn(`⚠️ Failed to send password change email to ${user.email}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error in onboarding cron job:', error);
  }
};

// 🔐 Generate a strong temporary password
function generateTempPassword(length = 10) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const number = '0123456789';
  const special = '@$!%*?&';
  const all = upper + lower + number + special;

  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    number[Math.floor(Math.random() * number.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  return password.sort(() => 0.5 - Math.random()).join('');
}

// 🔐 Generate activation token safely
function generateActivationToken(email) {
  return crypto
    .createHash('sha256')
    .update(String(email) + Date.now()) // Ensures the data is a string
    .digest('hex');
}

module.exports = sendPendingOnboardingEmails;
