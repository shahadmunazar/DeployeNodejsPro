// seeders/YYYYMMDDHHMMSS-demo-purchases.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Purchases', [
      {
        vendor_name: 'Vendor A',
        po_number: 'PO001',
        invoice_date: '2025-03-01',
        invoice_no: 'INV001',
        purchase_date: '2025-03-05',
        purchase_price: 1200.50,
        ownership_type: 'Self-Owned',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor B',
        po_number: 'PO002',
        invoice_date: '2025-03-02',
        invoice_no: 'INV002',
        purchase_date: '2025-03-06',
        purchase_price: 1000.75,
        ownership_type: 'Partner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor C',
        po_number: 'PO003',
        invoice_date: '2025-03-03',
        invoice_no: 'INV003',
        purchase_date: '2025-03-07',
        purchase_price: 1500.00,
        ownership_type: 'Self-Owned',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor D',
        po_number: 'PO004',
        invoice_date: '2025-03-04',
        invoice_no: 'INV004',
        purchase_date: '2025-03-08',
        purchase_price: 2000.10,
        ownership_type: 'Partner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor E',
        po_number: 'PO005',
        invoice_date: '2025-03-05',
        invoice_no: 'INV005',
        purchase_date: '2025-03-09',
        purchase_price: 2500.25,
        ownership_type: 'Self-Owned',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor F',
        po_number: 'PO006',
        invoice_date: '2025-03-06',
        invoice_no: 'INV006',
        purchase_date: '2025-03-10',
        purchase_price: 500.00,
        ownership_type: 'Partner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor G',
        po_number: 'PO007',
        invoice_date: '2025-03-07',
        invoice_no: 'INV007',
        purchase_date: '2025-03-11',
        purchase_price: 1800.80,
        ownership_type: 'Self-Owned',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor H',
        po_number: 'PO008',
        invoice_date: '2025-03-08',
        invoice_no: 'INV008',
        purchase_date: '2025-03-12',
        purchase_price: 2200.90,
        ownership_type: 'Partner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor I',
        po_number: 'PO009',
        invoice_date: '2025-03-09',
        invoice_no: 'INV009',
        purchase_date: '2025-03-13',
        purchase_price: 1300.40,
        ownership_type: 'Self-Owned',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        vendor_name: 'Vendor J',
        po_number: 'PO010',
        invoice_date: '2025-03-10',
        invoice_no: 'INV010',
        purchase_date: '2025-03-14',
        purchase_price: 1700.60,
        ownership_type: 'Partner',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Purchases', null, {});
  }
};
