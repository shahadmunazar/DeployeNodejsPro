const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const ContractorDocuments = require("../models/contractor_company_document")(sequelize, DataTypes);

const getFormIncompletePage = async (plain, requiredPage1Fields, requiredPage5Fields) => {
    if (requiredPage1Fields.some(field => !plain[field])) return 1;

    if (!plain.employee_insure_doc_id) return 2;

    if (!plain.public_liability_doc_id) return 3;

    if (!plain.organization_safety_management_id) return 4;

    if (requiredPage5Fields.some(field => !plain[field])) return 5;

    return null;
};


const getRequiredDocs = async (plain) => {
    const [employeeInsuranceDoc, publicLiabilityDoc, safetyDoc] = await Promise.all([
        ContractorDocuments.findByPk(plain.employee_insure_doc_id),
        ContractorDocuments.findByPk(plain.public_liability_doc_id),
        ContractorDocuments.findByPk(plain.organization_safety_management_id),
    ]);
    return {
        employeeInsuranceDoc: employeeInsuranceDoc,
        publicLiabilityDoc: publicLiabilityDoc,
        safetyDoc: safetyDoc
    }
}

module.exports = {
    getFormIncompletePage, getRequiredDocs
}