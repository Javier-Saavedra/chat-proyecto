const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const setupChat = require("./web/chat");

const app = express();
app.use(bodyParser.json());

// Servir frontend (carpeta Frontend)
app.use(express.static(path.join(__dirname, "../Frontend")));

// Redirigir raíz al login.html
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../Frontend/login.html"));
});

// Rutas API
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
setupChat(wss);

const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
