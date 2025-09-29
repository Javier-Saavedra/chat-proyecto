const express = require("express");
const router = express.Router();
const { validateUser } = require("../models/users");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = validateUser(username, password);

  if (user) {
    res.json({ success: true, user: { username: user.username } });
  } else {
    res.status(401).json({ success: false, message: "Credenciales inválidas" });
  }
});

module.exports = router;
