const broadcast = require("../utils/broadcast");

function setupChat(wss) {
  // 🔹 Guardar usuarios conectados
  const connectedUsers = new Map();

  // 🔹 Historial de mensajes en memoria
  const chatHistory = [];

  wss.on("connection", (ws) => {
    let currentUser = null;

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);

      if (data.type === "login") {
        currentUser = data.username;
        connectedUsers.set(ws, currentUser);

        // 🔹 Enviar historial al nuevo usuario
        ws.send(JSON.stringify({
          type: "history",
          messages: chatHistory
        }));

        // Avisar a todos que alguien se conectó
        broadcast(wss.clients, {
          type: "system",
          text: `${data.username} se conectó`
        });

        // Enviar lista de usuarios conectados
        broadcast(wss.clients, {
          type: "users",
          users: Array.from(connectedUsers.values())
        });
      }

      if (data.type === "chat") {
        const newMessage = {
          type: "chat",
          username: data.username,
          text: data.text
        };

        // 🔹 Guardar en historial
        chatHistory.push(newMessage);

        // Enviar a todos
        broadcast(wss.clients, newMessage);
      }
    });

    ws.on("close", () => {
      if (currentUser) {
        connectedUsers.delete(ws);

        broadcast(wss.clients, {
          type: "system",
          text: `${currentUser} se desconectó`
        });

        // Actualizar lista de usuarios
        broadcast(wss.clients, {
          type: "users",
          users: Array.from(connectedUsers.values())
        });
      }
    });
  });
}

module.exports = setupChat;
