const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const Brand = require("../../../models/brand")(sequelize, DataTypes);

const moment = require("moment"); // Import moment.js for date formatting

const validateBrandData = [
  body("brand_name")
    .isString()
    .withMessage("Brand Name must be a string")
    .notEmpty()
    .withMessage("Brand Name is required")
    .isLength({ max: 255 })
    .withMessage("Brand Name should not exceed 255 characters"),
  body("description").isString().withMessage("Description must be a string").optional().isLength({ max: 500 }).withMessage("Description should not exceed 500 characters"),
  body("status").isBoolean().withMessage("Status must be a boolean value").optional(),
];
// Create Financial Information
const CreateBrands = async (req, res) => {
  try {
    // Validate the request
    await Promise.all(validateBrandData.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the request body
    const { brand_name, description, status } = req.body;

    // Create new brand
    const newBrand = await Brand.create({
      brand_name,
      description,
      status: status !== undefined ? status : true, // Default to true if not provided
    });

    // Respond with the created brand
    res.status(201).json({
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ message: "Error creating brand" });
  }
};

const GetBrandsList = async (req, res) => {
  try {
    // Fetch all brands from the database
    const brands = await Brand.findAll();

    // Format the brand records (you can format dates or any other fields as needed)
    const formattedBrands = brands.map(brand => {
      return {
        ...brand.toJSON(),
        createdAt: moment(brand.createdAt).format("DD/MM/YYYY"),
        updatedAt: moment(brand.updatedAt).format("DD/MM/YYYY"),
      };
    });

    // Respond with the list of brands
    res.status(200).json({
      message: "Brands fetched successfully",
      data: formattedBrands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Error fetching brands" });
  }
};

const GetBrandsListById = async (req, res) => {
  const { id } = req.params; // Extract the brand ID from the request parameters

  try {
    // Fetch the brand using findByPk (primary key lookup)
    const brand = await Brand.findByPk(id);

    // If no brand is found, return a 404 error with a meaningful message
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Format the date fields (optional, but useful if you want to format the `createdAt` and `updatedAt` dates)
    const formattedBrand = {
      ...brand.toJSON(),
      createdAt: moment(brand.createdAt).format("DD/MM/YYYY"),
      updatedAt: moment(brand.updatedAt).format("DD/MM/YYYY"),
    };

    // Return the brand information with formatted dates
    return res.status(200).json({
      message: "Brand fetched successfully",
      data: formattedBrand,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return res.status(500).json({
      message: "Error fetching brand",
      error: error.message,
    });
  }
};

const validateBrandUpdate = [
  body("brand_name").isString().withMessage("Brand Name must be a string").optional(),
  body("status").isBoolean().withMessage("Status must be a boolean").optional(),
  body("description").isString().withMessage("Description must be a string").optional(),
];

// Update Brand Controller
const UpdateBrands = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Validate the request body using express-validator
    await Promise.all(validateBrandUpdate.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the brand by ID
    const brand = await Brand.findByPk(id);

    // If no brand is found, return a 404 error
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Extract fields from the request body
    const { brand_name, status, description } = req.body;

    // Prepare an object for the update, including only fields that have changed
    const updateData = {};

    if (brand_name && brand_name !== brand.brand_name) {
      updateData.brand_name = brand_name;
    }
    if (status !== undefined && status !== brand.status) {
      // Check if status has been provided and is different
      updateData.status = status;
    }
    if (description && description !== brand.description) {
      updateData.description = description;
    }

    // If no fields are different, return a message indicating no update was made
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields have been updated" });
    }

    // Update the brand with the new data
    const updatedBrand = await brand.update(updateData);

    // Return the updated brand record
    return res.status(200).json({
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({
      message: "Error updating brand",
      error: error.message,
    });
  }
};

const DeleteBrands = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Check if the brand exists
    const brand = await Brand.findByPk(id);

    // If no record is found, return a 404 error
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Soft delete the brand (if paranoid is enabled in the model)
    await brand.destroy();

    // Return a success message after deletion
    return res.status(200).json({
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return res.status(500).json({
      message: "Error deleting brand",
      error: error.message,
    });
  }
};

const UpdateBrandsStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // Extract id and status from the request body

    // Validate that the status is either true or false
    if (status !== true && status !== false) {
      return res.status(400).json({ message: "Status must be true or false" });
    }

    // Find the brand by ID
    const brand = await Brand.findByPk(id);

    // If no brand is found, return a 404 error
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Update the brand status
    brand.status = status;
    await brand.save(); // Save the updated status to the database

    // Return a success message with the updated status
    return res.status(200).json({
      message: "Brand status updated successfully",
      status: brand.status,
    });
  } catch (error) {
    console.error("Error updating brand status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = {
  CreateBrands,
  GetBrandsList,
  GetBrandsListById,
  UpdateBrands,
  DeleteBrands,
  UpdateBrandsStatus,
};
