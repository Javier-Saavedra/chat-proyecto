const express = require("express");
const { findUser, updateUserStatus } = require("../models/users");

const router = express.Router();

// POST /api/login
router.post("/", (req, res) => {
  const { username, password } = req.body;

  const user = findUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  updateUserStatus(username, "online");
  res.json({ id: user.id, username: user.username });
});

module.exports = router;
