document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
    return;
  }

  const messagesContainer = document.getElementById("messages");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const userList = document.getElementById("userList");
  const chatTitle = document.getElementById("chatTitle");
  const statusSelect = document.getElementById("statusSelect");

  chatTitle.textContent = `Echat - Conectado como ${user.username}`;

  const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

  socket.onopen = () => {
        const socket = new WebSocket("wss://xxxx.ngrok.io");
  };

  socket.onmessage = (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch (e) { return; }

    if (data.type === "system") {
      addMessage("Sistema", data.text, "system");
    } else if (data.type === "chat") {
      addMessage(data.username, data.text, "user");
    } else if (data.type === "users") {
      console.log("Lista de usuarios recibida:", data.users); // 👀 debug
      renderUserList(data.users);
    }
  };

  function addMessage(username, text, type = "user") {
    const msg = document.createElement("div");
    msg.classList.add("message", type);

    if (type === "system") {
      msg.textContent = text;
    } else {
      const userSpan = document.createElement("span");
      userSpan.classList.add("user");
      userSpan.textContent = `${username}: `;

      const textSpan = document.createElement("span");
      textSpan.classList.add("text");
      textSpan.textContent = text;

      msg.appendChild(userSpan);
      msg.appendChild(textSpan);
    }

    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderUserList(usersArr) {
    userList.innerHTML = "";
    usersArr.forEach(u => {
      const li = document.createElement("li");

      const statusDot = document.createElement("span");
      statusDot.classList.add("status", u.status);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = u.username;

      li.appendChild(statusDot);
      li.appendChild(nameSpan);

      if (u.username === user.username) {
        li.classList.add("me");
      }

      userList.appendChild(li);
    });
  }

  // Enviar mensaje
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  socket.send(JSON.stringify({
    type: "chat",
    username: user.username,
    text
  }));
  messageInput.value = "";
});


  // Cambio de estado
  statusSelect.addEventListener("change", () => {
    const newStatus = statusSelect.value;
    socket.send(JSON.stringify({ type: "status", status: newStatus }));
  });
});
