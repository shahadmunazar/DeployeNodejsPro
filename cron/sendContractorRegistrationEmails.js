const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op, DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const User = require("../models/user");
const Role = require("../models/role");
const Organization = require("../models/organization")(sequelize, DataTypes);
const ContractorRegistration = require("../models/ContractorRegistration")(sequelize, DataTypes);
const ContractorInvitation = require("../models/contractorinvitations")(sequelize, DataTypes);
const ContractorRegisterInsurance = require("../models/contractorregisterinsurance")(sequelize, DataTypes);
const ContractorPublicLiability = require("../models/contractorpublicliability")(sequelize, DataTypes);
const ContractorOrganizationSafetyManagement = require("../models/contractororganizationsafetymanagement")(sequelize, DataTypes);

const sendContractorRegistrationEmail = require("../utils/sendContractorRegistrationEmail");

const sendContractorRegistrationEmails = async () => {
  try {
    console.log("Running contractor registration email cron job...");

    // Fetch all confirmed contractor registrations
    const confirmedRegistrations = await ContractorRegistration.findAll({
      where: { submission_status: "confirm_submit" },
    });

    if (confirmedRegistrations.length === 0) {
      console.log("No confirmed contractor registrations found.");
      return;
    }

    for (const registration of confirmedRegistrations) {
      try {
        console.log(`Processing registration ID: ${registration.id}`);

        const invitation = await ContractorInvitation.findOne({
          where: {
            send_status: null, // Or use 'pending' if using ENUM default
            id: registration.contractor_invitation_id,
          },
        });

        if (!invitation) {
          console.log(`No matching invitation found for registration ID: ${registration.id}`);
          continue;
        }

        const [insurance, publicLiability, safetyManagement] = await Promise.all([
          ContractorRegisterInsurance.findOne({ where: { contractor_id: registration.id } }),
          ContractorPublicLiability.findOne({ where: { contractor_id: registration.id } }),
          ContractorOrganizationSafetyManagement.findOne({ where: { contractor_id: registration.id } }),
        ]);

        const inviter = await User.findOne({ where: { id: invitation.invited_by } });
        const organization = inviter
          ? await Organization.findOne({ where: { user_id: inviter.id } })
          : null;

        const payload = {
          registration: registration?.dataValues || null,
          invitation: invitation?.dataValues || null,
          inviter: inviter?.dataValues || null,
          organization: organization?.dataValues || null,
          attachments: {
            insurance: insurance?.dataValues || null,
            publicLiability: publicLiability?.dataValues || null,
            safetyManagement: safetyManagement?.dataValues || null,
          },
        };

        // Try sending email
        await sendContractorRegistrationEmail(payload);

        //  Update status to 'sent'
        await invitation.update({ send_status: "sent" });

        console.log(`Email sent and status updated for: ${registration.contractor_company_name}`);
      } catch (innerError) {
        console.error(`Error processing registration ID ${registration.id}:`, innerError);

        // Update status to 'failed'
        if (registration.contractor_invitation_id) {
          await ContractorInvitation.update(
            { send_status: "failed" },
            { where: { id: registration.contractor_invitation_id } }
          );
        }
      }
    }

    console.log(" All contractor registration emails processed.");
  } catch (error) {
    console.error(" Cron job failed:", error);
  }
};

module.exports = sendContractorRegistrationEmails;
