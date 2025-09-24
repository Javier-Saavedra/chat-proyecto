const express = require("express");
const { getUsers } = require("../models/users");

const router = express.Router();

// GET /api/users
router.get("/", (req, res) => {
  const users = getUsers();
  res.json(users);
});

module.exports = router;
