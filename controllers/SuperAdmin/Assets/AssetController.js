const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // Adjust path if needed
const { DataTypes } = require("sequelize");
const Asset = require("../../../models/Asset")(sequelize, DataTypes);

// Function to validate Create Asset
const CreateAsset = async (req, res) => {
    try {
        await body('asset_name')
            .notEmpty().withMessage('Asset Name is required')
            .isLength({ max: 100 }).withMessage('Asset Name must be less than 100 characters')
            .run(req);
        await body('asset_image')
            .custom((value, { req }) => {
                if (req.files && req.files.asset_image) {
                    const file = req.files.asset_image[0];
                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (!validTypes.includes(file.mimetype)) {
                        throw new Error('Asset Image must be a .jpg, .jpeg, or .png file');
                    }
                    if (file.size > maxSize) {
                        throw new Error('Asset Image must not exceed 5MB');
                    }
                }
                return true;
            })
            .run(req);
        await body('asset_code')
            .optional()
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Asset Code must be alphanumeric with special characters allowed (_ and -)')
            .isLength({ max: 100 }).withMessage('Asset Code must be less than 100 characters')
            .run(req);
        await body('category_id')
            .isInt().withMessage('Category must be selected from a predefined dropdown')
            .notEmpty().withMessage('Category is required')
            .run(req);
        await body('cwip_invoice_id')
            .optional()
            .isAlphanumeric().withMessage('CWIP Invoice ID must be alphanumeric')
            .isLength({ max: 50 }).withMessage('CWIP Invoice ID must be less than 50 characters')
            .custom(async (value) => {
                if (value) {
                    const existingInvoice = await sequelize.models.Asset.findOne({ where: { cwip_invoice_id: value } });
                    if (existingInvoice) {
                        throw new Error('CWIP Invoice ID must be unique');
                    }
                }
                return true;
            })
            .run(req);

        
        await body('location')
            .withMessage('Location must be selected from the existing location list')
            .notEmpty().withMessage('Location is required')
            .run(req);
            await body('building')
            .withMessage('building must be selected from the existing location list')
            .notEmpty().withMessage('building is required')
            .run(req);   
            await body('floor')
            .withMessage('floor must be selected from the existing location list')
            .notEmpty().withMessage('floor is required')
            .run(req);
            await body('room')
            .withMessage('room must be selected from the existing location list')
            .notEmpty().withMessage('room is required')
            .run(req); 
            await body('level')
            .withMessage('level must be selected from the existing location list')
            .notEmpty().withMessage('level is required')
            .run(req);   
            
        // Status Validation (predefined values)
        await body('status')
            .isIn(['Active', 'Inactive', 'Under Maintenance']).withMessage('Status must be one of the predefined options')
            .optional({ checkFalsy: true }).default('Active')
            .run(req);

        // Condition Validation (predefined values)
        await body('condition')
            .isIn(['New', 'Good', 'Fair', 'Poor']).withMessage('Condition must be one of the predefined options')
            .notEmpty().withMessage('Condition is required')
            .run(req);
            await body('brand_id')
            .isInt().withMessage('Category must be selected from a predefined dropdown')
            .notEmpty().withMessage('Category is required')
            .run(req);
            await body('model')
            .withMessage('model must be selected from the existing location list')
            .notEmpty().withMessage('model is required')
            .run(req);   
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Proceed with asset creation logic if validation passes
        const assetData = {
            asset_name: req.body.asset_name,
            asset_code: req.body.asset_code || generateAutoAssetCode(),
            category_id: req.body.category_id,
            cwip_invoice_id: req.body.cwip_invoice_id,
            location_id: req.body.location_id,
            status: req.body.status || 'Active',
            condition: req.body.condition,
            brand: req.body.brand,
            model: req.body.model,
            linked_asset_id: req.body.linked_asset_id,
            description: req.body.description,
            purchase_price: req.body.purchase_price,
            asset_image: req.files ? req.files.asset_image[0].path : null,
            capitalization_price: req.body.capitalization_price,
            end_of_life_date: req.body.end_of_life_date,
            depreciation_percentage: req.body.depreciation_percentage,
            accumulated_depreciation: req.body.accumulated_depreciation,
            scrap_value: req.body.scrap_value,
            income_tax_depreciation_percentage: req.body.income_tax_depreciation_percentage,
            department_id: req.body.department_id,
            transferred_to: req.body.transferred_to,
            allotted_up_to: req.body.allotted_up_to,
            remarks: req.body.remarks,
            warranty_start_date: req.body.warranty_start_date,
            warranty_end_date: req.body.warranty_end_date,
        };

        // Create asset in the database
        const asset = await sequelize.models.Asset.create(assetData);
        return res.status(201).json({ message: 'Asset created successfully', asset });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Utility function for auto-generating asset code
const generateAutoAssetCode = () => {
    return 'ASSET-' + Date.now(); // Simple auto-generation based on timestamp
};

module.exports = {
    CreateAsset
};
