const express = require("express");
const router = express.Router();
const { getUsers } = require("../models/users");

router.get("/", (req, res) => {
  const users = getUsers().map(u => ({ username: u.username }));
  res.json(users);
});

module.exports = router;
