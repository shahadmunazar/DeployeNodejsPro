'use strict';

const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const Department = require("../../../models/Department")(sequelize, DataTypes); // Use the Department model

const moment = require("moment"); // Import moment.js for date formatting

// Validation rules for department data
const validateDepartmentData = [
  body("name")
    .isString()
    .withMessage("Department Name must be a string")
    .notEmpty()
    .withMessage("Department Name is required")
    .isLength({ max: 255 })
    .withMessage("Department Name should not exceed 255 characters"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description should not exceed 500 characters"),
  body("status")
    .isBoolean()
    .withMessage("Status must be a boolean value")
    .optional(),
];

// Create Department
const CreateDepartment = async (req, res) => {
  try {
    // Validate the request
    await Promise.all(validateDepartmentData.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the request body
    const { name, description, status } = req.body;

    // Create a new department
    const newDepartment = await Department.create({
      name,
      description,
      status: status !== undefined ? status : true, // Default to true if not provided
    });

    // Respond with the created department
    res.status(201).json({
      message: "Department created successfully",
      data: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Error creating department" });
  }
};

// Get All Departments
const GetDepartmentList = async (req, res) => {
  try {
    // Fetch all departments from the database
    const departments = await Department.findAll();

    // Format the department records (you can format dates or any other fields as needed)
    const formattedDepartments = departments.map(department => {
      return {
        ...department.toJSON(),
        created_at: moment(department.created_at).format("DD/MM/YYYY"),
        updated_at: moment(department.updated_at).format("DD/MM/YYYY"),
      };
    });

    // Respond with the list of departments
    res.status(200).json({
      message: "Departments fetched successfully",
      data: formattedDepartments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

// Get Department by ID
const GetDepartmentListById = async (req, res) => {
  const { id } = req.params; // Extract the department ID from the request parameters

  try {
    // Fetch the department using findByPk (primary key lookup)
    const department = await Department.findByPk(id);

    // If no department is found, return a 404 error with a meaningful message
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Format the date fields
    const formattedDepartment = {
      ...department.toJSON(),
      created_at: moment(department.created_at).format("DD/MM/YYYY"),
      updated_at: moment(department.updated_at).format("DD/MM/YYYY"),
    };

    // Return the department information with formatted dates
    return res.status(200).json({
      message: "Department fetched successfully",
      data: formattedDepartment,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    return res.status(500).json({
      message: "Error fetching department",
      error: error.message,
    });
  }
};

// Update Department Validation
const validateDepartmentUpdate = [
  body("name").isString().withMessage("Department Name must be a string").optional(),
  body("status").isBoolean().withMessage("Status must be a boolean").optional(),
  body("description").isString().withMessage("Description must be a string").optional(),
];

// Update Department
const UpdateDepartment = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Validate the request body using express-validator
    await Promise.all(validateDepartmentUpdate.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the department by ID
    const department = await Department.findByPk(id);

    // If no department is found, return a 404 error
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Extract fields from the request body
    const { name, status, description } = req.body;

    // Prepare an object for the update, including only fields that have changed
    const updateData = {};

    if (name && name !== department.name) {
      updateData.name = name;
    }
    if (status !== undefined && status !== department.status) {
      updateData.status = status;
    }
    if (description && description !== department.description) {
      updateData.description = description;
    }

    // If no fields are different, return a message indicating no update was made
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields have been updated" });
    }

    // Update the department with the new data
    const updatedDepartment = await department.update(updateData);

    // Return the updated department record
    return res.status(200).json({
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return res.status(500).json({
      message: "Error updating department",
      error: error.message,
    });
  }
};

// Delete Department
const DeleteDepartment = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Check if the department exists
    const department = await Department.findByPk(id);

    // If no record is found, return a 404 error
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Soft delete the department (if paranoid is enabled in the model)
    await department.destroy();

    // Return a success message after deletion
    return res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return res.status(500).json({
      message: "Error deleting department",
      error: error.message,
    });
  }
};

// Update Department Status
const UpdateDepartmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // Extract id and status from the request body

    // Validate that the status is either true or false
    if (status !== true && status !== false) {
      return res.status(400).json({ message: "Status must be true or false" });
    }

    // Find the department by ID
    const department = await Department.findByPk(id);

    // If no department is found, return a 404 error
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Update the department status
    department.status = status;
    await department.save(); // Save the updated status to the database

    // Return a success message with the updated status
    return res.status(200).json({
      message: "Department status updated successfully",
      status: department.status,
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
  CreateDepartment,
  GetDepartmentList,
  GetDepartmentListById,
  UpdateDepartment,
  DeleteDepartment,
  UpdateDepartmentStatus,
};
