require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed
const JobModel = require('../models/job');       // Adjust path as needed

// Initialize Job model
const Job = JobModel(sequelize, DataTypes);

class EmailQueue {
  constructor() {
    this.name = 'email';
  }

  async add(jobName, data) {
    try {
      const job = await Job.create({
        type: jobName,   // Save jobName here
        payload: data,   // Save the data object as payload
        status: 'pending',
        attempts: 0,
      });
      console.log(`📥 Job added: ${job.id} (${jobName})`);
      return job;
    } catch (err) {
      console.error('❌ Failed to add job:', err.message);
      throw err;
    }
  }
}

module.exports = new EmailQueue();
