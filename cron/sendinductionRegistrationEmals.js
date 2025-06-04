const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const moment = require("moment");
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
const ContractorRegistrationInduction = require("../models/ContractorInductionRegistration")(sequelize, DataTypes);
const IdentityCardPdf = require("../PdfGenerator/identitycardpdf");
const sendConfirmationEmail = require("../helpers/sendConfirmationEmail");

const sendinductionRegistrationEmails = async () => {
  try {
    console.log("Running contractor induction registration email cron job...");

    const confirmedRegistrations = await ContractorRegistrationInduction.findAll({
      where: { agree_terms: "submit" },
    });

    if (confirmedRegistrations.length === 0) {
      console.log("No confirmed contractor registrations found.");
      return;
    }

    for (const registration of confirmedRegistrations) {
      try {
        console.log(`Processing registration ID: ${registration.id}`);

        let nameOrganization = registration.organization_name;

        if (registration.invited_by_organization) {
          const invitedUser = await User.findOne({ where: { id: registration.invited_by_organization } });
          const invitedOrg = await Organization.findOne({ where: { user_id: invitedUser?.id } });
          if (invitedOrg) {
            nameOrganization = invitedOrg.organization_name;
          }
        }


        const pdfData = {
          useremail: registration.email,
          name: registration.first_name,
          company_name: nameOrganization,
          phone_number:registration.phone_number,
          userId: registration.invited_by_organization,
          tradeType: registration.trade_type,
          user_image: registration.user_image,
          expiry_date: moment(registration.createdAt).add(1, 'year').format('DD-MM-YYYY'),
        };

        const pdfPath = await IdentityCardPdf(pdfData);

        if (fs.existsSync(pdfPath)) {
          console.log("PDF path exists:", pdfPath);
          await sendConfirmationEmail(
            registration.email,
            registration,
            nameOrganization,
            pdfPath
          );

          // Mark status as 'sent'
          await registration.update({ agree_terms: "sent" });

          console.log(`✅Email sent to: ${registration.email}`);
        } else {
          console.warn("PDF not found for:", registration.email);
          await registration.update({ agree_terms: "failed" });
        }

      } catch (innerError) {
        console.error(`Error processing registration ID ${registration.id}:`, innerError);
        await registration.update({ agree_terms: "failed" });
      }
    }

    console.log("✅ All contractor registration emails processed.");
  } catch (error) {
    console.error("Contractor induction registration email cron failed:", error);
  }
};

module.exports = sendinductionRegistrationEmails;
