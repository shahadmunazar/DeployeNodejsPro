'use strict';

const { model } = require('mongoose');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true, // Unique asset name
      },
      // Change this to a separate table for images (AssetImages)
      asset_image: {
        type: Sequelize.STRING, // Storing the image URL or path in the assets table
        allowNull: true, // Can be null if no images uploaded
      },
      asset_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true, // Ensure unique asset code (either custom or auto-generated)
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AssetCategories', // Foreign key referencing the AssetCategories table
          key: 'id',
        },
        onDelete: 'CASCADE', // If a category is deleted, all assets under that category will be deleted
      },
      cwip_invoice_id: {
        type: Sequelize.STRING(50),
        allowNull: true, // Optional CWIP Invoice ID
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false, // Location field required
      },
      status: {
        type: Sequelize.ENUM('In Use', 'In Stock', 'Out for Repair'),
        allowNull: false,
        defaultValue: 'In Stock',
      },
      condition: {
        type: Sequelize.ENUM('New', 'Good', 'Damaged', 'Poor'),
        allowNull: false,
        defaultValue: 'New',
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'brands', // Foreign key referencing the brands table
          key: 'id',
        },
        onDelete: 'CASCADE', // If a brand is deleted, all assets under that brand will be deleted
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      linked_asset: {
        type: Sequelize.JSON, // To store child assets as an array of IDs (using JSON instead of JSONB)
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      upload_files: {
        type: Sequelize.JSON, // Storing files associated with the asset (e.g., PDFs, DOCX) as JSON
        allowNull: true,
      },
      purchases_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Purchases',
          key: 'id',
        },
        onDelete: 'SET NULL', // If the purchase record is deleted, set this field to null
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors', // Foreign key linking to the Vendor model
          key: 'id',
        },
        onDelete: 'SET NULL', // If the vendor is deleted, set this field to null
      },
      finacial_info_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'FinancialInformations',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      asset_transfers_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'asset_transfers',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      po_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      invoice_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      purchase_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      self_owned_or_partner: {
        type: Sequelize.ENUM('Self-Owned', 'Partner'),
        allowNull: false,
        defaultValue: 'Self-Owned',
      },
      capitalization_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      end_of_life: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      capitalization_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      depreciation_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      accumulated_depreciation: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      scrap_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      income_tax_depreciation_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      transferred_to: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      allotted_up_to: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      amc_vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors', // Foreign key for AMC vendor
          key: 'id',
        },
        onDelete: 'SET NULL', // If the vendor is deleted, set this field to null
      },
      warranty_vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'WarrantyMaintenanceInsurances', // Foreign key for Warranty vendor
          key: 'id',
        },
        onDelete: 'SET NULL', // If the vendor is deleted, set this field to null
      },
      amc_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      amc_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      warranty_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      warranty_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      insurance_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      insurance_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      effective_life: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assets');
  },
};
