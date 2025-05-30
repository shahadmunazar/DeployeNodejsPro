const { Op } = require("sequelize");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const { getIO } = require("../../socket");

const ContractorRegistration = require("../../../models/ContractorRegistration")(sequelize, DataTypes);

const GetSubmissionPrequalificationNotification = async (req, res) => {
  try {
    const newSubmissions = await ContractorRegistration.findAll({
      where: {
        submission_status: "confirm_submit",
        notified_prequalification: false,
      },
      attributes: ["id", "contractor_email", "contractor_name", "createdAt", "abn_number"],
    });

    if (!newSubmissions.length) {
      return res.status(200).json({
        success: true,
        message: "No new prequalification submissions found",
        data: [],
      });
    }

    const io = getIO(); // get socket instance
    io.emit("new-prequalification", newSubmissions); // send to all connected clients
    console.log("📡 Emitted new-prequalification to clients");
    await ContractorRegistration.update(
      { notified_prequalification: true },
      {
        where: {
          id: {
            [Op.in]: newSubmissions.map(sub => sub.id),
          },
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "New prequalification submissions notified",
      data: newSubmissions,
    });
  } catch (error) {
    console.error("Error in GetSubmissionPrequalificationNotification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { GetSubmissionPrequalificationNotification };
