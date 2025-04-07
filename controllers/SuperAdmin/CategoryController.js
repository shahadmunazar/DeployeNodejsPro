const { body, validationResult } = require("express-validator");
const sequelize = require("../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const AssetCategory = require("../../models/assetcategory")(sequelize, DataTypes);

const CreateCategory = async (req, res) => {
  await Promise.all([
    body("name")
      .notEmpty().withMessage("Category name is required")
      .isLength({ max: 100 }).withMessage("Category name must be less than 100 characters")
      .run(req),
    body("description")
      .optional()
      .isLength({ max: 255 }).withMessage("Description must be under 255 characters")
      .run(req),
    body("status")
      .optional()
      .isBoolean().withMessage("Status must be true or false")
      .run(req),
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description = "", status = true } = req.body;
  try {
    const existing = await AssetCategory.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const category = await AssetCategory.create({
      name,
      description,
      status,
    });
    return res.status(200).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("CreateCategory Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const GetAllCategory = async (req, res) => {
    try {
      const getall = await AssetCategory.findAll(); // Await the result
      return res.status(200).json({
        message: "All categories fetched successfully",
        data: getall,
      });
    } catch (error) {
      console.error("GetAllCategory Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const GetCategoryById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const category = await AssetCategory.findByPk(id);
        if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.status(200).json({
        message: "Category fetched successfully",
        data: category,
      });
    } catch (error) {
      console.error("GetCategoryById Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const UpdateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
  
    // Inline validations
    const validationErrors = [];
  
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        validationErrors.push({ msg: "Category name must be a non-empty string", param: "name" });
      } else if (name.length > 100) {
        validationErrors.push({ msg: "Category name must be less than 100 characters", param: "name" });
      }
    }
  
    if (description !== undefined && description.length > 255) {
      validationErrors.push({ msg: "Description must be under 255 characters", param: "description" });
    }
  
    if (status !== undefined && typeof status !== "boolean") {
      validationErrors.push({ msg: "Status must be true or false", param: "status" });
    }
  
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
  
    try {
      const category = await AssetCategory.findByPk(id);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      if (name !== undefined) category.name = name;
      if (description !== undefined) category.description = description;
      if (status !== undefined) category.status = status;
  
      await category.save();
  
      return res.status(200).json({
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      console.error("UpdateCategory Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const StatusUpdate = async (req, res) => {
    try {
      const { id, status } = req.body;
      if (status !== true && status !== false) {
        return res.status(400).json({ message: 'Status must be true or false' });
      }
      const category = await AssetCategory.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      category.status = status;
      await category.save();
      return res.status(200).json({
        message: 'Category status updated successfully',
        status: category.status
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const CategoryDelete = async (req, res) => {
    try {
      // Get the ID from the request parameters (assuming you are passing the ID in the URL)
      const { id } = req.params;
  
      // Find the category by ID
      const category = await AssetCategory.findByPk(id); // Assuming you're using Sequelize ORM
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Delete the category
      await category.destroy();
  
      // Send a success response
      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

module.exports = {
  CreateCategory,GetAllCategory,GetCategoryById,UpdateCategory,StatusUpdate,CategoryDelete
};
