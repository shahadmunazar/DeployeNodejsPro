const { body, validationResult } = require('express-validator');
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require('sequelize');

const PurchaseModel = require("../../../models/Purchases")(sequelize, DataTypes);


// Custom function to validate DD/MM/YYYY date format
const isValidDateFormat = (date) => {
    // Regex to validate DD/MM/YYYY format
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
    return regex.test(date);
};

const CreatePurchase = async (req, res) => {

    try {
        await promises.all([
            body('vendor_name')
                .notEmpty().withMessage('vendor_name is required')
                .run(req),
            body('po_number')
                .notEmpty().withMessage('po_number is required')
                .run(req),
            body('invoice_date')
                .custom(isValidDateFormat).withMessage('invoice_date Start Date must be in DD/MM/YYYY format')
                .run(req),
            body('invoice_no')
            .notEmpty().withMessage('invoice_no is required')
                .run(req),
            body('purchase_date')
                .custom(isValidDateFormat).withMessage('purchase_date Start Date must be in DD/MM/YYYY format')
                .run(req),
            body('purchase_price')
            .notEmpty().withMessage('purchase_price is required')
                .run(req),
            body('ownership_type')
            .notEmpty().withMessage('ownership_type is required')
                .run(req),
            // body('insurance_end_date')
            //     .custom(isValidDateFormat).withMessage('Insurance End Date must be in DD/MM/YYYY format')
            //     .run(req)
        ])

        
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

     // Destructure the data from the request body
     const {
        vendor_name,
        po_number,
        invoice_date,
        invoice_no,
        purchase_date,
        purchase_price,
        ownership_type,
        
      } = req.body;

       const newPurchase = await PurchaseModel.create({
        vendor_name,
        po_number,
        invoice_date: invoice_date.split("/").reverse().join("-"),
        invoice_no,
        purchase_date: purchase_date.split("/").reverse().join("-"),
        purchase_price,
        ownership_type,
    });

    return res.status(200).json({
        status: true,
        message: "Purchase created successfully",
        data: newPurchase,
    });

    } catch(error) { 
        console.error("Error creating purchase:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        });

    }

}

const GetAllPurchase = async (req, res) => {
    try {
        const purchases = await PurchaseModel.findAll();
        return res.status(200).json({
            status: true,
            message: "Purchase fetched successfully",
            data: purchases,
        });
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

const UpdatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await PurchaseModel.findByPk(id);

        if (!purchase) {
            return res.status(404).json({
                status: false,
                message: "Purchase not found",
            });
        }

        // Prepare an update object with only the fields that are present
        const updateData = {};

        if (req.body.vendor_name !== undefined) updateData.vendor_name = req.body.vendor_name;
        if (req.body.po_number !== undefined) updateData.po_number = req.body.po_number;
        if (req.body.invoice_date !== undefined) {
            updateData.invoice_date = req.body.invoice_date.split("/").reverse().join("-");
        }
        if (req.body.invoice_no !== undefined) updateData.invoice_no = req.body.invoice_no;
        if (req.body.purchase_date !== undefined) {
            updateData.purchase_date = req.body.purchase_date.split("/").reverse().join("-");
        }
        if (req.body.purchase_price !== undefined) updateData.purchase_price = req.body.purchase_price;
        if (req.body.ownership_type !== undefined) updateData.ownership_type = req.body.ownership_type;

        await purchase.update(updateData);

        return res.status(200).json({
            status: true,
            message: "Purchase updated successfully",
            data: purchase,
        });

    } catch (error) {
        console.error("Error updating purchase:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const DeletePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await PurchaseModel.findByPk(id);

        if (!purchase) {
            return res.status(404).json({
                status: false,
                message: "Purchase not found",
            });
        }

        await purchase.destroy();

        return res.status(200).json({
            status: true,
            message: "Purchase deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting purchase:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports = {
    CreatePurchase,GetAllPurchase,UpdatePurchase,DeletePurchase
};

