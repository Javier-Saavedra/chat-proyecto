const broadcast = require("../utils/broadcast");
const { updateUserStatus } = require("../models/users");

function chatHandler(ws, wss) {
  console.log("Nuevo cliente conectado");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      ws.username = data.username;
      updateUserStatus(data.username, "online");

      broadcast(wss, { type: "system", message: `${data.username} se ha conectado` });
    }

    if (data.type === "chat") {
      broadcast(wss, { type: "chat", username: data.username, text: data.text });
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      updateUserStatus(ws.username, "offline");
      broadcast(wss, { type: "system", message: `${ws.username} se ha desconectado` });
    }
  });
}

module.exports = chatHandler;
