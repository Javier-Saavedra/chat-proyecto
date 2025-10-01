// backend/web/chat.js
const broadcast = require("../utils/broadcast");

function setupChat(wss) {
  // Map: username -> { ws, status }
  const usersMap = new Map();

  function sendUsersList() {
    const users = Array.from(usersMap.entries()).map(([username, u]) => ({
      username,
      status: u.status || "online"
    }));
    broadcast(wss.clients, { type: "users", users });
  }

  wss.on("connection", (ws) => {
    console.log("Nuevo cliente conectado");

    ws.on("message", (msg) => {
      let data;
      try {
        data = JSON.parse(msg);
      } catch (err) {
        console.warn("Mensaje no JSON", err);
        return;
      }

      // 🔹 Login: registrar usuario + status
      if (data.type === "login") {
        ws.username = data.username; // guardar el nombre en el socket
        usersMap.set(data.username, { ws, status: data.status || "online" });
        broadcast(wss.clients, { type: "system", text: `${data.username} se conectó` });
        sendUsersList();
        return;
      }

      // 🔹 Cambio de estado
      if (data.type === "status" && ws.username) {
        if (usersMap.has(ws.username)) {
          usersMap.get(ws.username).status = data.status;
          sendUsersList();
        }
        return;
      }

      // 🔹 Chat: si tiene "to" es mensaje privado
      if (data.type === "chat") {
        const payload = {
          type: "chat",
          from: data.username,
          to: data.to || null,
          text: data.text,
          time: Date.now()
        };

        if (data.to) {
          // 🟢 mensaje privado → solo al destinatario + emisor
          const recipient = Array.from(wss.clients).find(c => c.username === data.to);

          if (recipient && recipient.readyState === 1) {
            recipient.send(JSON.stringify(payload));
          }

          if (ws.readyState === 1) {
            ws.send(JSON.stringify(payload));
          }

        } else {
          // 🟠 si no hay "to", es mensaje global → broadcast
          broadcast(wss.clients, payload);
        }
      } // 👈 AQUÍ cierro bien el if de chat
    });

    // 🔹 Evento: cuando se desconecta
    ws.on("close", () => {
      if (ws.username) {
        usersMap.delete(ws.username);
        broadcast(wss.clients, { type: "system", text: `${ws.username} se desconectó` });
        sendUsersList();
      }
    });

    ws.on("error", (err) => console.error("WS error:", err));
  });
}

module.exports = setupChat;
