const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const Industry = require("../../../models/industry")(sequelize, DataTypes);
const CreateIndustry = async (req, res) => {
  try {
    const { name } = req.body;
    const existingIndustry = await Industry.findOne({ where: { name } });
    if (existingIndustry) {
      return res.status(400).json({ message: "Industry already exists" });
    }

    // Create new industry
    const newIndustry = await Industry.create({ name });
    return res.status(201).json({ message: "Industry created successfully", newIndustry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const GetAllIndustries = async (req, res) => {
  try {
    const industries = await Industry.findAll();
    return res.status(200).json({ message: "Industry Retrieved successfully", data: industries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};
const GetIndustryById = async (req, res) => {
  const { id } = req.params;
  try {
    const industry = await Industry.findOne({ where: { id } });

    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    return res.status(200).json({ industry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const UpdateIndustry = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const industry = await Industry.findOne({ where: { id } });

    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    industry.name = name || industry.name;
    await industry.save();

    return res.status(200).json({ message: "Industry updated successfully", industry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const SoftDeleteIndustry = async (req, res) => {
  const { id } = req.params;

  try {
    const industry = await Industry.findOne({ where: { id } });

    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    // Soft delete (set deletedAt timestamp)
    await industry.destroy();

    return res.status(200).json({ message: "Industry deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};
module.exports = { CreateIndustry, SoftDeleteIndustry, UpdateIndustry, GetIndustryById, GetAllIndustries };
