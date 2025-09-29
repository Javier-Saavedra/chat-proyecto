const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersPath = path.join(__dirname, "../data/users.json");

// 🔹 Ruta de login: si el usuario no existe, lo crea automáticamente
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos" });
  }

  let users = [];

  // Leer usuarios guardados
  if (fs.existsSync(usersPath)) {
    users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  }

  let user = users.find(u => u.username === username);

  if (!user) {
    // 🔹 Crear usuario nuevo automáticamente
    user = { username, password };
    users.push(user);

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    console.log(`Nuevo usuario creado: ${username}`);
    return res.json({ success: true, user, message: "Usuario creado y logueado" });
  }

  // Si existe pero la contraseña no coincide
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
  }

  res.json({ success: true, user, message: "Login exitoso" });
});

module.exports = router;
