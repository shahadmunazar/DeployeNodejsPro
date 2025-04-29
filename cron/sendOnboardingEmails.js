const User = require('../models/user');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Role = require("../models/role");
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const Organization = require("../models/organization")(sequelize, DataTypes);
const sendOnboardingEmail = require('../utils/sendOnboardingEmail');
const PasswordChangesEmail = require('../utils/PasswordChangesEmail');
const { Op } = require('sequelize');

const sendPendingOnboardingEmails = async () => {
  try {
    console.log("Running onboarding email cron job...");

    const currentTime = new Date(); // Get the current time
    console.log(`Current time: ${currentTime.toISOString()}`);

    // Step 1: Check and update expired users
    const expiredUsers = await User.findAll({
      where: {
        onboarding_email_sent: true,
        invitation_status: 'sent',
        activation_expires_at: {
          [Op.lt]: currentTime, // Check if activation_expires_at is less than the current date
        },
      },
    });

    // Update users whose invitations have expired
    for (const user of expiredUsers) {
      const activationExpiresAt = new Date(user.activation_expires_at);
      console.log(`User: ${user.email} - Activation expires at: ${activationExpiresAt.toISOString()}`);

      // Calculate the difference in milliseconds
      const timeDifference = currentTime - activationExpiresAt; 

      // Convert difference to minutes or seconds
      const diffInMinutes = Math.floor(timeDifference / (1000 * 60));
      const diffInSeconds = Math.floor(timeDifference / 1000);

      // Print the time difference
      console.log(`Time difference for ${user.email}: ${diffInMinutes} minutes (${diffInSeconds} seconds)`);

      if (user.invitation_status !== 'accepted') {
        await user.update({
          invitation_status: 'expired',  
          activation_expires_at: null,
        });
        console.log(`Invitation expired for user ${user.email}`);
      } else {
        console.log(`Skipping update for ${user.email} because the invitation is accepted.`);
      }
    }

    // Step 2: Fetch users who have not received an onboarding email or whose password was changed
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { onboarding_email_sent: false },
          { passwordChanged: true },
        ],
      },
      include: [
        {
          model: Role,
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    // Step 3: Process each user and handle email sending
    for (const user of users) {
      // Skip users without an email
      if (!user.email) {
        console.warn(`Skipping user (ID: ${user.id}) - email is missing.`);
        continue;
      }

      const tempPassword = generateTempPassword();
      const activationToken = generateActivationToken(user.email);

      // Fetch organization using user_id
      const organization = await Organization.findOne({
        where: { user_id: user.id },
        attributes: ['organization_name'],
      });

      const orgName = organization?.organization_name?.replace(/\s+/g, '-').toLowerCase() || 'user-login';
      const activationLink = `http://localhost:5173/${orgName}/login`;

      // Step 4: If onboarding email has not been sent, send onboarding email
      if (!user.onboarding_email_sent) {
        await user.update({
          password: await bcrypt.hash(tempPassword, 10),
          activation_token: activationToken,
          invitation_status: 'sent',
          activation_expires_at: new Date(Date.now() + 100 * 60 * 1000), // 10 minutes
        });

        const emailSent = await sendOnboardingEmail({
          email: user.email,
          name: user.name,
          tempPassword,
          activationLink,
        });

        if (emailSent) {
          await user.update({ onboarding_email_sent: true });
          console.log(`Onboarding email sent to ${user.email}`);
        } else {
          console.warn(`Failed to send onboarding email to ${user.email}`);
        }

      } else if (user.passwordChanged === true) {
        // Step 5: If password was changed, send a password change email
        const emailSent = await PasswordChangesEmail({
          email: user.email,
          name: user.name,
          type: 'passwordChanged'
        });

        if (emailSent) {
          await user.update({ passwordChanged: false });
          console.log(`Password change email sent to ${user.email}`);
        } else {
          console.warn(`Failed to send password change email to ${user.email}`);
        }
      }
    }

  } catch (error) {
    console.error('Error in onboarding cron job:', error);
  }
};

//  Generate a strong temporary password
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

//  Generate activation token safely
function generateActivationToken(email) {
  return crypto
    .createHash('sha256')
    .update(String(email) + Date.now())
    .digest('hex');
}

module.exports = sendPendingOnboardingEmails;
