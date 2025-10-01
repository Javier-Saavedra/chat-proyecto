document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    // Si no hay usuario guardado → volver al login
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
    return;
  }

  const messagesContainer = document.getElementById("messages");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatTitle = document.getElementById("chatTitle");
  const sidebarList = document.getElementById("tutoresList");
  const statusSelect = document.getElementById("statusSelect");

  // 👀 Mostrar siempre el mismo nombre guardado en localStorage
  chatTitle.textContent = `Echat - Conectado como ${user.username}`;
  let currentStatus = "disponible";

  // ... aquí va todo lo demás igual que ya tienes (WebSocket, mensajes, renderUsers, etc.)


  const socket = new WebSocket("ws://localhost:3000");
  // const socket = new WebSocket("wss://xxxx.ngrok.io");

  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: "login",
      username: user.username,
      status: currentStatus
    }));
  };

  socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📩 Mensaje recibido:", data); // 👈 debug

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
  console.log("👥 Lista de usuarios recibida en frontend:", users); // 👈 debug

  sidebarList.innerHTML = "";
  users.forEach(u => {
    console.log("🔹 Pintando:", u); // 👈 debug

    const li = document.createElement("div");
    li.classList.add("sidebar-user");

    const dot = document.createElement("span");
    dot.classList.add("status-dot", u.status || "disponible");

    const name = document.createElement("span");
    name.textContent = u.username || u; // 👈 fallback por si aún llega string

    li.appendChild(dot);
    li.appendChild(name);
    sidebarList.appendChild(li);
  });
}
  sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;

    socket.send(JSON.stringify({ type: "chat", username: user.username, text }));
    messageInput.value = "";
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });

  statusSelect.addEventListener("change", () => {
    currentStatus = statusSelect.value;
    socket.send(JSON.stringify({
      type: "status",
      username: user.username,
      status: currentStatus
    }));
  });
});
