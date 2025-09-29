// backend/web/chat.js
const broadcast = require("../utils/broadcast");

function setupChat(wss) {
  const usersMap = new Map(); // username -> { ws, status }

  function sendUsersList() {
    const users = Array.from(usersMap.entries()).map(([username, u]) => ({
      username,
      status: u.status
    }));
    broadcast(wss.clients, { type: "users", users });
  }

  wss.on("connection", (ws) => {
    console.log("Nuevo cliente conectado");

    ws.on("message", (msg) => {
      let data;
      try { data = JSON.parse(msg); } catch (err) {
        console.warn("Mensaje no JSON", err);
        return;
      }

      // Login
      if (data.type === "login" && data.username) {
        ws.username = data.username;
        usersMap.set(data.username, { ws, status: "online" });

        broadcast(wss.clients, { type: "system", text: `${data.username} se conectó` });
        sendUsersList();
      }

      // Mensaje de chat
      if (data.type === "chat") {
        broadcast(wss.clients, { type: "chat", username: data.username, text: data.text });
      }

      // Cambio de estado
      if (data.type === "status" && ws.username) {
        if (usersMap.has(ws.username)) {
          usersMap.get(ws.username).status = data.status;
          broadcast(wss.clients, { type: "system", text: `${ws.username} está ${data.status}` });
          sendUsersList();
        }
      }
    });

    ws.on("close", () => {
      if (ws.username) {
        usersMap.delete(ws.username);
        broadcast(wss.clients, { type: "system", text: `${ws.username} se desconectó` });
        sendUsersList();
      }
    });
  });
}

module.exports = setupChat;
