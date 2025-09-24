const chatSocket = (() => {
  const socket = new WebSocket(`ws://${window.location.host}`);

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", username: user.username }));
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {
      addMessage(data.username, data.text);
    }

    if (data.type === "system") {
      addMessage("Sistema", data.message);
    }
  });

  function send(payload) {
    socket.send(JSON.stringify(payload));
  }

  return { send };
})();
