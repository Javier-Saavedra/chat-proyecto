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
  const chatTitle = document.getElementById("chatTitle");
  const sidebarList = document.getElementById("tutoresList");

  chatTitle.textContent = `Echat - Conectado como ${user.username}`;

  const socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "login", username: user.username }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "system") {
      addMessage("Sistema", data.text, "system");
    } else if (data.type === "chat") {
      addMessage(data.username, data.text, "user");
    } else if (data.type === "users") {
      renderUsers(data.users);
    } else if (data.type === "history") {
      data.messages.forEach(m => {
        if (m.type === "chat") {
          addMessage(m.username, m.text, "user");
        } else if (m.type === "system") {
          addMessage("Sistema", m.text, "system");
        }
      });
    }
  };

  function addMessage(username, text, type = "user") {
    const msg = document.createElement("div");
    msg.classList.add("message", type);

    const userSpan = document.createElement("span");
    userSpan.classList.add("user");
    userSpan.textContent = `${username}: `;

    const textSpan = document.createElement("span");
    textSpan.classList.add("text");
    textSpan.textContent = text;

    msg.appendChild(userSpan);
    msg.appendChild(textSpan);
    messagesContainer.appendChild(msg);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderUsers(users) {
  sidebarList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("div");
    li.classList.add("sidebar-user");
    li.textContent = u.username; // 👈 en vez de mostrar el objeto entero
    sidebarList.appendChild(li);
  });
}

  // ✅ Enviar mensaje con botón
  sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;

    socket.send(JSON.stringify({ type: "chat", username: user.username, text }));
    messageInput.value = "";
  });

  // ✅ Enviar mensaje con Enter
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });
});
