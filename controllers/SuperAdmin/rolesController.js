const express = require("express");
const Validator = require("fastest-validator");
const Role = require("../../models/role");
const v = new Validator();

async function CreateRoles(req, res) {
  try {
    const schema = {
      name: { type: "string", empty: false, messages: { required: "Name is required" } },
    };
    const check = v.compile(schema);
    const validationResult = check(req.body);
    if (validationResult !== true) {
      return res.status(400).json({ errors: validationResult });
    }
    const existingRole = await Role.findOne({ where: { name: req.body.name } });
    if (existingRole) {
      return res.status(400).json({ errors: "Role already exists" });
    }
    const role = await Role.create({ name: req.body.name });
    res.status(200).json({ message: "Role created successfully", role });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function GetAllRoles(req, res) {
  try {
    const roles = await Role.findAll();
    res.json({ status: 200, message: "All Roles Fetch Successfully", data: roles });
  } catch (error) {}
}

async function GetRoleById(req, res) {
  try {
    const roleId = parseInt(req.body.id, 10);
    const schema = {
      id: { type: "number", integer: true, positive: true, messages: { required: "Role ID is required", number: "Role ID must be a number." } },
    };
    const check = v.compile(schema);
    const validationResult = check({ id: roleId });
    if (validationResult !== true) {
      return res.status(400).json({ errors: validationResult });
    }
    const existingRole = await Role.findOne({ where: { id: roleId } });
    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.status(200).json({ data: existingRole });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function UpdateRoles(req, res) {
  try {
    const { id, name } = req.body;
    const schema = {
      id: { type: "number", integer: true, positive: true, messages: { required: "Role ID is required", number: "Role ID must be a number." } },
      name: { type: "string", min: 3, max: 50, empty: false, messages: { required: "Role name is required", stringMin: "Role name must be at least 3 characters long." } },
    };
    const check = v.compile(schema);
    const validationResult = check({ id, name });
    if (validationResult !== true) {
      return res.status(400).json({ errors: validationResult });
    }
    const existingRole = await Role.findOne({ where: { id } });
    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }
    existingRole.name = name;
    await existingRole.save();
    res.status(200).json({ message: "Role updated successfully", data: existingRole });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function CreateAdmin(req, res) {
  try {
    console.log("check routes");
  } catch (error) {}
}

module.exports = { CreateRoles, GetAllRoles, UpdateRoles, GetRoleById, CreateAdmin };
