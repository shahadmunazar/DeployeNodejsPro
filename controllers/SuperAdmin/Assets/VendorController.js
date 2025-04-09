"use strict";

const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const Vendor = require("../../../models/Vendor")(sequelize, DataTypes); // Use the Vendor model

const moment = require("moment"); // Import moment.js for date formatting

const validateVendorData = [
  body("name")
    .isString()
    .withMessage("Vendor Name must be a string")
    .notEmpty()
    .withMessage("Vendor Name is required")
    .isLength({ max: 255 })
    .withMessage("Vendor Name should not exceed 255 characters"),
  body("contact_name").isString().withMessage("Contact Name must be a string").optional().isLength({ max: 255 }).withMessage("Contact Name should not exceed 255 characters"),
  body("contact_email")
    .isEmail()
    .withMessage("Contact Email must be a valid email")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Contact Email should not exceed 255 characters"),
  body("contact_phone")
    .isString()
    .withMessage("Contact Phone must be a valid phone number")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Contact Phone should not exceed 50 characters"),
  body("address").isString().withMessage("Address must be a string").optional().isLength({ max: 255 }).withMessage("Address should not exceed 255 characters"),
  body("status").isBoolean().withMessage("Status must be a boolean value").optional(),
];

// Create Vendor
const CreateVendor = async (req, res) => {
  try {
    // Validate the request
    await Promise.all(validateVendorData.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the request body
    const { name, contact_name, contact_email, contact_phone, address, status } = req.body;

    // Create a new vendor
    const newVendor = await Vendor.create({
      name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      status: status !== undefined ? status : true, // Default to true if not provided
    });

    // Respond with the created vendor
    res.status(201).json({
      message: "Vendor created successfully",
      data: newVendor,
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Error creating vendor" });
  }
};

// Get All Departments
// Get All Vendors
const GetVendorList = async (req, res) => {
  try {
    // Fetch all vendors from the database
    const vendors = await Vendor.findAll();

    // Format the vendor records (you can format dates or any other fields as needed)
    const formattedVendors = vendors.map(vendor => {
      return {
        ...vendor.toJSON(),
        created_at: moment(vendor.created_at).format("DD/MM/YYYY"),
        updated_at: moment(vendor.updated_at).format("DD/MM/YYYY"),
      };
    });

    // Respond with the list of vendors
    res.status(200).json({
      message: "Vendors fetched successfully",
      data: formattedVendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors" });
  }
};

// Get Department by ID
const GetVendorListById = async (req, res) => {
  const { id } = req.params; // Extract the vendor ID from the request parameters

  try {
    // Fetch the vendor using findByPk (primary key lookup)
    const vendor = await Vendor.findByPk(id);

    // If no vendor is found, return a 404 error with a meaningful message
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Format the date fields
    const formattedVendor = {
      ...vendor.toJSON(),
      created_at: moment(vendor.created_at).format("DD/MM/YYYY"),
      updated_at: moment(vendor.updated_at).format("DD/MM/YYYY"),
    };

    // Return the vendor information with formatted dates
    return res.status(200).json({
      message: "Vendor fetched successfully",
      data: formattedVendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return res.status(500).json({
      message: "Error fetching vendor",
      error: error.message,
    });
  }
};

// Update Department Validation
const validateVendorUpdate = [
  body("name").isString().withMessage("Vendor Name must be a string").optional(),
  body("contact_name").isString().withMessage("Contact Name must be a string").optional(),
  body("contact_email").isEmail().withMessage("Contact Email must be a valid email").optional(),
  body("contact_phone").isString().withMessage("Contact Phone must be a valid phone number").optional(),
  body("address").isString().withMessage("Address must be a string").optional(),
  body("status").isBoolean().withMessage("Status must be a boolean").optional(),
];

// Update Vendor
const UpdateVendor = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Validate the request body using express-validator
    await Promise.all(validateVendorUpdate.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the vendor by ID
    const vendor = await Vendor.findByPk(id);

    // If no vendor is found, return a 404 error
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Extract fields from the request body
    const { name, contact_name, contact_email, contact_phone, address, status } = req.body;

    // Prepare an object for the update, including only fields that have changed
    const updateData = {};

    if (name && name !== vendor.name) {
      updateData.name = name;
    }
    if (contact_name && contact_name !== vendor.contact_name) {
      updateData.contact_name = contact_name;
    }
    if (contact_email && contact_email !== vendor.contact_email) {
      updateData.contact_email = contact_email;
    }
    if (contact_phone && contact_phone !== vendor.contact_phone) {
      updateData.contact_phone = contact_phone;
    }
    if (address && address !== vendor.address) {
      updateData.address = address;
    }
    if (status !== undefined && status !== vendor.status) {
      updateData.status = status;
    }

    // If no fields are different, return a message indicating no update was made
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields have been updated" });
    }

    // Update the vendor with the new data
    const updatedVendor = await vendor.update(updateData);

    // Return the updated vendor record
    return res.status(200).json({
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return res.status(500).json({
      message: "Error updating vendor",
      error: error.message,
    });
  }
};

// Delete Department
const DeleteVendor = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Check if the vendor exists
    const vendor = await Vendor.findByPk(id);

    // If no record is found, return a 404 error
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Delete the vendor permanently
    await vendor.destroy();

    // Return a success message after deletion
    return res.status(200).json({
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return res.status(500).json({
      message: "Error deleting vendor",
      error: error.message,
    });
  }
};

// Update Department Status
const UpdateVendorStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // Extract id and status from the request body

    // Validate that the status is either true or false
    if (status !== true && status !== false) {
      return res.status(400).json({ message: "Status must be true or false" });
    }

    // Find the department by ID
    const vendor = await Vendor.findByPk(id);

    // If no department is found, return a 404 error
    if (!vendor) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Update the department status
    vendor.status = status;
    await vendor.save(); // Save the updated status to the database

    // Return a success message with the updated status
    return res.status(200).json({
      message: "Department status updated successfully",
      status: vendor.status,
    });
  } catch (error) {
    console.error("Error updating department status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Export all the operations
module.exports = {
  CreateVendor,
  GetVendorList,
  GetVendorListById,
  UpdateVendor,
  DeleteVendor,
  UpdateVendorStatus,
};
