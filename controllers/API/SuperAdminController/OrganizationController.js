const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const User = require("../../../models/user");
const Organization = require("../../../models/organization")(sequelize, DataTypes);
const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const UserRoles = require("../../../models/userrole");
const Roles = require("../../../models/role");
const { Op } = require("sequelize");
const Industry = require("../../../models/industry")(sequelize, DataTypes);
const Plan = require("../../../models/AllPlans")(sequelize, DataTypes);

// ✅ Validation
const validateOrganization = [
  body("organization_name").notEmpty().withMessage("Organization name is required"),
  body("industryId").optional().isInt().withMessage("Industry ID must be a number"),
  body("organization_address").optional().isString(),
  body("city").optional().isString(),
  body("state").optional().isString(),
  body("name").notEmpty().withMessage("Admin name is required"),
  body("email").optional(),
  body("user_name").optional().isString().withMessage("Username must be a string"),
  body("plan_id").optional(),
  body("postal_code").optional().isLength({ max: 10 }),
  body("registration_id").optional().isString(),
  body("contact_phone_number")
    .optional()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone format"),
  body("number_of_employees").optional().isIn(["1-10", "11-50", "51-200", "201-500", "500+"]),
];

const CreateOrganization = async (req, res) => {
  try {
    if (!req.files?.logo || !req.files?.agreement_paper) {
      return res.status(400).json({
        success: false,
        message: "Both logo and agreement paper are required",
      });
    }
   
    await Promise.all(validateOrganization.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status:400,success: false, errors: errors });
    }
    
    const {
      organization_name,
      industryId,
      organization_address,
      city,
      state,
      postal_code,
      registration_id,
      contact_phone_number,
      number_of_employees,
      name,
      email,
      user_name,
      plan_id,
    } = req.body;

    if (!email && !user_name) {
      return res.status(400).json({
        success: false,
        message: "Either email or username is required.",
      });
    }

    const logoPath = req.files.logo[0].filename;
    const agreementPaperPath = req.files.agreement_paper[0].filename;


    let finalRegistrationId = registration_id;

    if (!finalRegistrationId) {
      const prefix = organization_name.replace(/\s/g, "").toUpperCase().slice(0, 4);
      const existingCount = await Organization.count({
        where: {
          registration_id: {
            [Op.like]: `${prefix}%`,
          },
        },
      }); 
      const nextNumber = String(existingCount + 1).padStart(6, "0");
      finalRegistrationId = `${prefix}${nextNumber}`;
      console.log("final result",finalRegistrationId);
    }
    // Step 1: Create organization
    const newOrganization = await Organization.create({
      organization_name,
      industryId,
      organization_address,
      city,
      state,
      postal_code,
      registration_id: finalRegistrationId, 
      number_of_employees,
      logo: logoPath,
      agreement_paper: agreementPaperPath,
      plan_id: plan_id || null,
    });

    console.log("final Orginazation Result",newOrganization);
    // Step 2: Create admin user


    const createdUser = await User.findOne({ where: { email } });
if (createdUser) {
  return res.status(400).json({
    success: false,
    status:400,
    message: "Email is already in use.",
  });
}

const tempPassword = generateTempPassword();
const hashedPassword = await bcrypt.hash(tempPassword, 10);

const newUser = await User.create({
  name,
  email,
  user_name,
  password: hashedPassword,
});
   
    // Step 3: Update org with user ID
    await newOrganization.update({ user_id: newUser.id });

    // Step 4: Assign role
    const newUserRole = await UserRoles.create({
      userId: newUser.id,
      roleId: 2,
    });

    // Step 5: Add subscription if plan exists
    let newSubscription = null;
    if (plan_id) {
      newSubscription = await OrganizationSubscribeUser.create({
        user_id: newUser.id,
        org_id: newOrganization.id,
        plan_id,
        validity_start_date: new Date(),
        validity_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization, admin user, and subscription created successfully",
      organization: newOrganization,
      user: {
        ...newUser.toJSON(),
        plain_password: tempPassword,
      },
      user_role: newUserRole,
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("Error in CreateOrganization:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Password Generator
function generateTempPassword(length = 10) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const number = "0123456789";
  const special = "@$!%*?&";
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

  return password.sort(() => 0.5 - Math.random()).join("");
}
const GetAllOrganization = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      order: [['id', 'DESC']]
    });
    
    if (!organizations || organizations.length === 0) {
      return res.status(400).json({
        success: false,
        status:400,
        message: "No organizations found",
      });
    }

    const orgSubscribersPromises = organizations.map(async organization => {
      // Fetch subscribers
      const subscribers = await OrganizationSubscribeUser.findAll({
        where: { org_id: organization.id },
      });

      // Get users
      const userPromises = subscribers.map(async subscriber => {
        const user = await User.findOne({
          where: { id: subscriber.user_id },
        });
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          invitation_status: user.invitation_status,
        };
      });

      const users = await Promise.all(userPromises);
      const filteredUsers = users.filter(user => user !== null);

      // Get roles
      const rolesPromises = subscribers.map(async subscriber => {
        const user = await User.findOne({ where: { id: subscriber.user_id } });
        if (!user) return null;

        const userRoles = await UserRoles.findAll({
          where: { userId: user.id },
        });

        const rolePromises = userRoles.map(async userRole => {
          const role = await Roles.findOne({
            where: { id: userRole.roleId },
          });
          return role ? role.name : null;
        });

        const roles = await Promise.all(rolePromises);
        return roles.filter(role => role !== null);
      });

      const roles = await Promise.all(rolesPromises);
      const flattenedRoles = roles.flat().filter(role => role);

      // ✅ Get Industry name
      let industryName = null;
      if (organization.industryId) {
        const industry = await Industry.findOne({
          where: { id: organization.industryId },
          attributes: ["name"],
        });
        industryName = industry ? industry.name : null;
      }

      // ✅ Get Plan name
      let planName = null;
      if (organization.plan_id) {
        const plan = await Plan.findOne({
          where: { id: organization.plan_id },
          attributes: ["name"],
        });
        planName = plan ? plan.name : null;
      }
      const baseUrl = `${req.protocol}://${req.get("host")}`; // e.g. http://localhost:3000
      return {
        id: organization.id,
        organization_name: organization.organization_name,
        industryId: organization.industryId,
        industry_name: industryName, // ✅ Added industry name
        plan_id: organization.plan_id,
        plan_name: planName, // ✅ Added plan name
        contact_phone_number: organization.contact_phone_number,
        number_of_employees: organization.number_of_employees,
        registration_id: organization.registration_id,
        logo_url: organization.logo ? `${baseUrl}/uploads/organization/logo/${organization.logo}` : null,
        agreement_url: organization.agreement_paper ? `${baseUrl}/uploads/organization/agreement_paper/${organization.agreement_paper}` : null,
        organization_address: organization.organization_address,
        city: organization.city,
        state: organization.state,
        postal_code: organization.postal_code,
        users: filteredUsers,
        roles: flattenedRoles,
      };
    });

    const orgWithSubscribers = await Promise.all(orgSubscribersPromises);

    return res.status(200).json({
      success: true,
      message: "Organizations and related data fetched successfully",
      data: orgWithSubscribers,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetOrgnizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({ where: { id } });

    if (!organization) {
      return res.status(400).json({
        success: false,
        status:400,
        message: "Organization not found",
      });
    }

    // Fetch subscribers
    const subscribers = await OrganizationSubscribeUser.findAll({
      where: { org_id: organization.id },
    });

    // Get users
    const userPromises = subscribers.map(async subscriber => {
      const user = await User.findOne({
        where: { id: subscriber.user_id },
      });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        invitation_status: user.invitation_status,
      };
    });

    const users = await Promise.all(userPromises);
    const filteredUsers = users.filter(user => user !== null);

    // Get roles
    const rolesPromises = subscribers.map(async subscriber => {
      const user = await User.findOne({ where: { id: subscriber.user_id } });
      if (!user) return null;

      const userRoles = await UserRoles.findAll({
        where: { userId: user.id },
      });

      const rolePromises = userRoles.map(async userRole => {
        const role = await Roles.findOne({
          where: { id: userRole.roleId },
        });
        return role ? role.name : null;
      });

      const roles = await Promise.all(rolePromises);
      return roles.filter(role => role !== null);
    });

    const roles = await Promise.all(rolesPromises);
    const flattenedRoles = roles.flat().filter(role => role);

    // ✅ Get Industry name
    let industryName = null;
    if (organization.industryId) {
      const industry = await Industry.findOne({
        where: { id: organization.industryId },
        attributes: ["name"],
      });
      industryName = industry ? industry.name : null;
    }

    // ✅ Get Plan name
    let planName = null;
    if (organization.plan_id) {
      const plan = await Plan.findOne({
        where: { id: organization.plan_id },
        attributes: ["name"],
      });
      planName = plan ? plan.name : null;
    }

    // Final response
    const result = {
      id: organization.id,
      organization_name: organization.organization_name,
      industryId: organization.industryId,
      industry_name: industryName,
      plan_id: organization.plan_id,
      plan_name: planName,
      organization_address: organization.organization_address,
      city: organization.city,
      state: organization.state,
      postal_code: organization.postal_code,
      users: filteredUsers,
      roles: flattenedRoles,
    };

    return res.status(200).json({
      success: true,
      message: "Organization fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching organization by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const validateOrganizationUpdate = [
  body("organization_name").optional(),
  body("industryId").optional().isInt(),
  body("organization_address").optional(),
  body("city").optional(),
  body("state").optional(),
  body("postal_code").optional().isLength({ max: 4 }),
  body("registration_id").optional(),
  body("contact_phone_number")
    .optional(),
  body("number_of_employees").optional().isIn(["1-10", "11-50", "51-200", "201-500", "500+"]),
  body("name").optional(),
  body("email").optional().isEmail(),
  body("user_name").optional(),
  body("plan_id").optional(),
];

const UpdateOrginzation = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(400).json({ status:400,success: false, message: "Organization not found" });
    }

    await Promise.all(validateOrganizationUpdate.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status:400,success: false, errors: errors });
    }

    const {
      organization_name,
      industryId,
      organization_address,
      city,
      state,
      postal_code,
      registration_id,
      contact_phone_number,
      number_of_employees,
      plan_id,
      name,
      email,
      user_name,
    } = req.body;

    // 🖼️ Handle updated files
    if (req.files?.logo) {
      organization.logo = req.files.logo[0].path;
    }
    if (req.files?.agreement_paper) {
      organization.agreement_paper = req.files.agreement_paper[0].path;
    }

    // 📦 Update organization fields conditionally
    const orgFields = {
      organization_name,
      industryId,
      organization_address,
      city,
      state,
      postal_code,
      registration_id,
      contact_phone_number,
      number_of_employees,
      plan_id,
    };

    Object.entries(orgFields).forEach(([key, value]) => {
      if (value !== undefined) organization[key] = value;
    });

    await organization.save();

    // 👤 Update user if exists
    let adminUser = null;
    let newUserRole = null;
    let subscription = null;

    if (organization.user_id) {
      adminUser = await User.findByPk(organization.user_id);

      if (adminUser) {
        const userFields = { name, email, user_name };

        Object.entries(userFields).forEach(([key, value]) => {
          if (value !== undefined) {
            adminUser[key] = value;
          }
        });

        await adminUser.save();

        // 🧑‍⚖️ Update user role
        // if (role_id) {
        //   await UserRoles.destroy({ where: { userId: adminUser.id } });
        //   newUserRole = await UserRoles.create({
        //     userId: adminUser.id,
        //     roleId: role_id,
        //   });
        // }

        // 📅 Update subscription
        if (plan_id) {
          subscription = await OrganizationSubscribeUser.findOne({
            where: { user_id: adminUser.id, org_id: organization.id },
          });

          if (subscription) {
            await subscription.update({
              plan_id,
              validity_start_date: new Date(),
              validity_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            });
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      organization,
      user: adminUser,
      user_role: newUserRole,
      subscription,
    });
  } catch (error) {
    console.error("❌ Error in UpdateOrganization:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const ManagmentOrginazation = async (req, res) => {
  try {
    const { status, plan_type, registration_from, registration_to, organization_name } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;

    if (registration_from && registration_to) {
      whereClause.createdAt = {
        [Op.between]: [startOfDay(registration_from), endOfDay(registration_to)],
      };
    } else if (registration_from) {
      whereClause.createdAt = {
        [Op.between]: [startOfDay(registration_from), endOfDay(registration_from)],
      };
    } else if (registration_to) {
      whereClause.createdAt = {
        [Op.between]: [startOfDay(registration_to), endOfDay(registration_to)],
      };
    }

    if (organization_name) {
      whereClause.organization_name = {
        [Op.like]: `%${organization_name}%`,
      };
    }

    const organizations = await Organization.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!organizations || organizations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No organizations found",
      });
    }

    const orgSubscribersPromises = organizations.map(async organization => {
      const subscribers = await OrganizationSubscribeUser.findAll({
        where: { org_id: organization.id },
      });

      const userPromises = subscribers.map(async subscriber => {
        const user = await User.findOne({
          where: { id: subscriber.user_id },
        });
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          invitation_status: user.invitation_status,
        };
      });

      const users = (await Promise.all(userPromises)).filter(u => u !== null);

      const rolesPromises = subscribers.map(async subscriber => {
        const user = await User.findOne({ where: { id: subscriber.user_id } });
        if (!user) return null;

        const userRoles = await UserRoles.findAll({ where: { userId: user.id } });

        const roleNames = await Promise.all(
          userRoles.map(async userRole => {
            const role = await Roles.findOne({ where: { id: userRole.roleId } });
            return role ? role.name : null;
          })
        );

        return roleNames.filter(r => r !== null);
      });

      const roles = await Promise.all(rolesPromises);
      const flattenedRoles = roles.flat().filter(role => role);

      // ✅ Industry
      let industryName = null;
      if (organization.industryId) {
        const industry = await Industry.findOne({
          where: { id: organization.industryId },
          attributes: ["name"],
        });
        industryName = industry ? industry.name : null;
      }

      let planName = null;

      if (organization.plan_id) {
        console.log(`🔍 Org ID: ${organization.id} - Plan ID: ${organization.plan_id}`);
        const plan = await Plan.findOne({
          where: { id: organization.plan_id },
          attributes: ["id", "name"],
        });
        planName = plan ? plan.name : null;
        console.log(`✅ Org ID: ${organization.id} → Plan Name: ${planName}`);
        if (plan_type && planName !== plan_type) {
          console.log(`❌ Skipping Org ID: ${organization.id} - Plan mismatch`);
          return null;
        }
      } else if (plan_type) {
        console.log(`❌ Skipping Org ID: ${organization.id} - No plan, but filter applied`);
        return null;
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`; // e.g. http://localhost:3000
      return {
        id: organization.id,
        organization_name: organization.organization_name,
        industryId: organization.industryId,
        industry_name: industryName,
        plan_id: organization.plan_id,
        plan_name: planName,
        organization_address: organization.organization_address,
        city: organization.city,
        state: organization.state,
        status: organization.status,
        logo_url: organization.logo ? `${baseUrl}/uploads/organization/logo/${organization.logo}` : null,
        agreement_url: organization.agreement_paper ? `${baseUrl}/uploads/organization/agreement_paper/${organization.agreement_paper}` : null,
        postal_code: organization.postal_code,
        createdAt: formatDate(organization.createdAt),
        updatedAt: formatDate(organization.updatedAt),
        users: users,
        roles: flattenedRoles,
      };
    });

    const orgWithSubscribers = (await Promise.all(orgSubscribersPromises)).filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Organizations and related data fetched successfully",
      data: orgWithSubscribers,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const formatDate = date => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const ToogleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    if (status === true || status === 1) {
      status = 1;
    } else if (status === false || status === 0) {
      status = 0;
    } else {
      return res.status(400).json({
        success: false,
        message: "Status must be either true/false or 1/0",
      });
    }

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    await organization.update({ status });

    return res.status(200).json({
      success: true,
      status: 200,
      message: `Organization status updated successfully.`,
      data: {
        id: organization.id,
        status: Boolean(status),
      },
    });
  } catch (error) {
    console.error("Error in ToogleStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetOrginazationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Subscribers
    const subscribers = await OrganizationSubscribeUser.findAll({
      where: { org_id: organization.id },
    });

    // Users info
    const userPromises = subscribers.map(async subscriber => {
      const user = await User.findOne({
        where: { id: subscriber.user_id },
      });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        invitation_status: user.invitation_status,
        isActive: user.isActive,
      };
    });

    const users = (await Promise.all(userPromises)).filter(Boolean);

    // Roles
    const rolesPromises = subscribers.map(async subscriber => {
      const user = await User.findOne({ where: { id: subscriber.user_id } });
      if (!user) return null;

      const userRoles = await UserRoles.findAll({ where: { userId: user.id } });

      const roleNames = await Promise.all(
        userRoles.map(async userRole => {
          const role = await Roles.findOne({ where: { id: userRole.roleId } });
          return role ? role.name : null;
        })
      );

      return roleNames.filter(Boolean);
    });

    const roles = await Promise.all(rolesPromises);
    const flattenedRoles = roles.flat().filter(role => role);

    // Industry
    let industryName = null;
    if (organization.industryId) {
      const industry = await Industry.findOne({
        where: { id: organization.industryId },
        attributes: ["name"],
      });
      industryName = industry ? industry.name : null;
    }

    // Plan
    let planName = null;
    if (organization.plan_id) {
      const plan = await Plan.findOne({
        where: { id: organization.plan_id },
        attributes: ["id", "name"],
      });
      planName = plan ? plan.name : null;
    }

    // Role Summary
    const roleSummary = flattenedRoles.reduce((summary, role) => {
      summary[role] = (summary[role] || 0) + 1;
      return summary;
    }, {});

    const activeUserCount = users.filter(u => u.isActive).length;
    const baseUrl = `${req.protocol}://${req.get("host")}`; // e.g. http://localhost:3000

    return res.status(200).json({
      success: true,
      message: "Organization details fetched successfully",
      data: {
        id: organization.id,
        organization_name: organization.organization_name,
        industryId: organization.industryId,
        industry_name: industryName,
        plan_id: organization.plan_id,
        plan_name: planName,
        organization_address: organization.organization_address,
        city: organization.city,
        state: organization.state,
        status: organization.status,
        postal_code: organization.postal_code,
        logo_url: organization.logo ? `${baseUrl}/uploads/organization/logo/${organization.logo}` : null,
        agreement_url: organization.agreement_paper ? `${baseUrl}/uploads/organization/agreement_paper/${organization.agreement_paper}` : null,
        createdAt: formatDate(organization.createdAt),
        updatedAt: formatDate(organization.updatedAt),
        users,
        roles: flattenedRoles,
        activeUserCount,
        roleSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching organization by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetUserSubscriptionList = async (req, res) => {
  try {
    // Query all subscriptions from OrganizationSubscribeUser
    const subscriptions = await OrganizationSubscribeUser.findAll({
      order: [["createdAt", "DESC"]], // Sorting by creation date
    });

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subscriptions found",
      });
    }

    // Process each subscription individually
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async subscription => {
        // Fetch the user details for each subscription
        const user = await User.findOne({
          where: { id: subscription.user_id },
          attributes: ["id", "name", "email", "username"],
        });

        // Fetch the organization details for each subscription
        const organization = await Organization.findOne({
          where: { id: subscription.org_id },
          attributes: ["id", "organization_name"],
        });

        // Fetch the plan details for each subscription
        const plan = await Plan.findOne({
          where: { id: subscription.plan_id },
          attributes: ["id", "name", "tier", "price_monthly", "price_yearly"],
        });

        // Determine the billing cycle based on monthly or yearly pricing
        const billingCycle = plan.price_monthly ? "Monthly" : "Annually";

        return {
          organization_name: organization ? organization.organization_name : null,
          admin_name: user ? user.name : null,
          admin_contact: user ? user.email : null, // Assuming admin's contact is their email
          plan_name: plan ? plan.name : null,
          plan_tier: plan ? plan.tier : null,
          subscription_status: subscription.subscription_status,
          subscription_start_date: formatDate(subscription.validity_start_date),
          renewal_end_date: formatDate(subscription.validity_end_date),
          billing_cycle: billingCycle,
          payment_status: subscription.payment_status,
          renewal_date: formatDate(subscription.renewal_date), // Added renewal_date
          validity_start_date: formatDate(subscription.validity_start_date), // Added validity_start_date
          validity_end_date: formatDate(subscription.validity_end_date), // Added validity_end_date
          createdAt: formatDate(subscription.createdAt), // Added createdAt
          updatedAt: formatDate(subscription.updatedAt), // Added updatedAt
        };
      })
    );

    // Send the response with formatted data
    res.status(200).json({
      success: true,
      message: "Subscription list fetched successfully",
      data: subscriptionsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription list",
      error: error.message,
    });
  }
};

module.exports = {
  CreateOrganization,
  GetAllOrganization,
  GetOrgnizationById,
  UpdateOrginzation,
  ManagmentOrginazation,
  ToogleStatus,
  GetOrginazationDetails,
  GetUserSubscriptionList,
};
