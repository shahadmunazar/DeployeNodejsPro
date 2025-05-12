// const { ContractorRegistration } = require('../models');

// const TestingRoute = async (req, res) => {
//   try {
//     const contractors = await ContractorRegistration.findAll({
//       include: [
//         {
//           association: 'insurances', // alias from ContractorRegisterInsurance
//         },
//         {
//           association: 'publicLiabilities', // alias from ContractorPublicLiability
//         },
//         {
//           association: 'safetyManagements', // alias from ContractorOrganizationSafetyManagement
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       data: contractors
//     });
//   } catch (error) {
//     console.error('Error fetching contractor data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contractor data.',
//       error: error.message
//     });
//   }
// };

// module.exports = { TestingRoute };
