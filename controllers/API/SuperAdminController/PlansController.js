const { tryCatch } = require("bullmq");
// const Plan =  require("../../../models/AllPlans");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const Plan = require("../../../models/AllPlans")(sequelize, DataTypes);
const { Op } = require("sequelize");

// Create a new plan
const CreatePlans = async (req, res) => {
  try {
    const { name, description, tier, features, asset_limit, user_limit, price_monthly, price_yearly, price_custom, billing_cycle,  status  = true, additional_info } = req.body;
    if (!name || !tier || !user_limit || !billing_cycle) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, tier, user_limit, billing_cycle",
      });
    }

    // Normalize features
    const parsedFeatures = Array.isArray(features) ? features : typeof features === "string" ? features.split(",").map(f => f.trim()) : [];

    const newPlan = await Plan.create({
      name,
      description,
      tier,
      features: parsedFeatures,
      asset_limit,
      user_limit,
      price_monthly,
      price_yearly,
      price_custom,
      billing_cycle,
      status,
      additional_info,
    });

    return res.status(200).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating plan",
      error: error.message,
    });
  }
};

// Get all plans (active/inactive)
const GetPlans = async (req, res) => {
  try {
    const {
      status,
      tier,
      min_price,
      max_price,
      from_date,
      to_date,
      sort_by = "createdAt",
      sort_order = "DESC", // ASC or DESC
    } = req.query;

    const whereClause = {};

    // Filter by status
    if (status) {
      whereClause.status = status.toLowerCase();
    }

    // Filter by tier
    if (tier) {
      whereClause.tier = tier;
    }

    // Filter by price range (checking price_monthly for now)
    if (min_price && max_price) {
      whereClause.price_monthly = {
        [Op.between]: [parseFloat(min_price), parseFloat(max_price)],
      };
    } else if (min_price) {
      whereClause.price_monthly = {
        [Op.gte]: parseFloat(min_price),
      };
    } else if (max_price) {
      whereClause.price_monthly = {
        [Op.lte]: parseFloat(max_price),
      };
    }

    // Filter by last modified date
    if (from_date && to_date) {
      whereClause.updatedAt = {
        [Op.between]: [new Date(from_date), new Date(to_date)],
      };
    } else if (from_date) {
      whereClause.updatedAt = {
        [Op.gte]: new Date(from_date),
      };
    } else if (to_date) {
      whereClause.updatedAt = {
        [Op.lte]: new Date(to_date),
      };
    }
    const plans = await Plan.findAll({
      where: whereClause,
      order: [[sort_by, sort_order.toUpperCase()]],
    });
    console.log("Plans", plans);
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plans",
      error: error.message,
    });
  }
};

// Get a specific plan by ID
const GetPlanById = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByPk(id);
    if (plan) {
      res.status(200).json({
        success: true,
        data: plan,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plan",
      error: error.message,
    });
  }
};

// Update an existing plan
const UpdatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, description, tier, features, asset_limit, user_limit, price_monthly, price_yearly, price_custom, billing_cycle, status, additional_info } = req.body;

  try {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Normalize features input
    const parsedFeatures = Array.isArray(features) ? features : typeof features === "string" ? features.split(",").map(f => f.trim()) : plan.features; // fallback to existing if not sent

    // Update fields only if they're provided
    plan.name = name ?? plan.name;
    plan.description = description ?? plan.description;
    plan.tier = tier ?? plan.tier;
    plan.features = parsedFeatures;
    plan.asset_limit = asset_limit ?? plan.asset_limit;
    plan.user_limit = user_limit ?? plan.user_limit;
    plan.price_monthly = price_monthly ?? plan.price_monthly;
    plan.price_yearly = price_yearly ?? plan.price_yearly;
    plan.price_custom = price_custom ?? plan.price_custom;
    plan.billing_cycle = billing_cycle ?? plan.billing_cycle;
    plan.status = status !== undefined ? status : plan.status;
    plan.additional_info = additional_info ?? plan.additional_info;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating plan",
      error: error.message,
    });
  }
};

// Soft delete a plan (paranoid deletion)
const DeletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByPk(id);
    if (plan) {
      await plan.destroy(); // This will set deletedAt and mark it as deleted
      res.status(200).json({
        success: true,
        message: "Plan deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting plan",
      error: error.message,
    });
  }
};

// Toggle the status of a plan (active/inactive)
const TogglePlanStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByPk(id);
    if (plan) {
      plan.status = !plan.status;
      await plan.save();

      res.status(200).json({
        success: true,
        message: "Plan status updated successfully",
        data: plan,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }
  } catch (error) {
    console.error("Error toggling plan status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling plan status",
      error: error.message,
    });
  }
};

module.exports = { CreatePlans, GetPlans, GetPlanById, UpdatePlan, DeletePlan, TogglePlanStatus };
