// ========================
// Conexión con Socket.IO
// ========================
const socket = io("http://localhost:3000");

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const user = localStorage.getItem("user") || "Anónimo";

// ========================
// Enviar mensaje
// ========================
function sendMessage() {
  const msg = input.value.trim();
  if (msg !== "" && selectedTutorId) {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const data = { user, text: msg, tutorId: selectedTutorId, time };
    socket.emit("chat message", data);

    // guardar en historial local
    const tutor = tutors.find((t) => t.id === selectedTutorId);
    if (tutor) {
      tutor.messages.push({ from: "student", text: msg, time });
    }

    renderMessage("student", msg, time, "Tú");
    input.value = "";
  }
}

// Botón enviar
sendBtn.addEventListener("click", sendMessage);

// Enter en input (sin duplicados)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // evita doble envío
    sendMessage();
  }
});

// ========================
// Recibir mensajes
// ========================
socket.on("chat message", (data) => {
  if (data.tutorId === selectedTutorId) {
    renderMessage("tutor", data.text, data.time, data.user);
  }
});

// ========================
// Función para renderizar mensajes
// ========================
function renderMessage(type, text, time, sender = "") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", type);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = sender ? `${sender}: ${text}` : text;

  const timestamp = document.createElement("time");
  timestamp.textContent = time;

  msgDiv.appendChild(bubble);
  msgDiv.appendChild(timestamp);

  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ========================
// Datos de tutores
// ========================
const tutors = [
  {
    id: "juan",
    name: "Juan Pérez",
    avatar: "./assets/tutors/juan.png",
    status: "available",
    lastMessage: "¿Tienes dudas sobre la tarea?",
    lastTime: "Hoy 4:15 PM",
    messages: [
      { from: "tutor", text: "Hola, ¿en qué puedo ayudarte?", time: "10:30 AM" },
      { from: "student", text: "Tengo dudas sobre la matrícula.", time: "10:31 AM" },
    ],
  },
  {
    id: "maria",
    name: "María López",
    avatar: "./assets/tutors/maria.png",
    status: "busy",
    lastMessage: "Te respondo enseguida...",
    lastTime: "Hoy 4:15 PM",
    messages: [
      { from: "tutor", text: "Te enviaré los pasos en breve.", time: "09:00 AM" },
    ],
  },
  {
    id: "carlos",
    name: "Carlos Ruiz",
    avatar: "./assets/tutors/carlos.png",
    status: "starting",
    lastMessage: "Iniciando sesión...",
    lastTime: "Ayer 3:20 PM",
    messages: [
      { from: "tutor", text: "Prueba de disponibilidad.", time: "08:00 AM" },
    ],
  },
];

// ========================
// Render Sidebar
// ========================
const tutorListEl = document.getElementById("tutorList");
const recentsEl = document.getElementById("recents");
const tutorSearch = document.getElementById("tutorSearch");
const tutorNameHeader = document.getElementById("tutorName");

function renderRecents() {
  recentsEl.innerHTML = "";
  tutors.slice(0, 4).forEach((t) => {
    const img = document.createElement("img");
    img.src = t.avatar;
    img.alt = t.name;
    img.className = "recent-avatar";
    img.title = t.name;
    img.addEventListener("click", () => selectTutor(t.id));
    recentsEl.appendChild(img);
  });
}

function renderTutors(filter = "") {
  tutorListEl.innerHTML = "";
  const q = filter.trim().toLowerCase();
  tutors.forEach((t) => {
    if (q && !t.name.toLowerCase().includes(q)) return;
    const li = document.createElement("li");
    li.className = "tutor-item";
    li.dataset.id = t.id;

    const avatar = document.createElement("img");
    avatar.className = "tutor-avatar";
    avatar.src = t.avatar;
    avatar.alt = t.name;

    const meta = document.createElement("div");
    meta.className = "tutor-meta";

    const name = document.createElement("div");
    name.className = "tutor-name";
    name.textContent = t.name;

    const sub = document.createElement("div");
    sub.className = "tutor-sub";

    const statusText = document.createElement("span");
    statusText.className =
      "status-text " +
      (t.status === "available"
        ? "available"
        : t.status === "busy"
        ? "busy"
        : "starting");
    statusText.textContent =
      t.status === "available"
        ? "Disponible"
        : t.status === "busy"
        ? "Ocupado"
        : "Iniciando";

    const time = document.createElement("span");
    time.className = "tutor-time";
    time.textContent = t.lastTime;

    sub.appendChild(statusText);
    sub.appendChild(time);

    meta.appendChild(name);
    meta.appendChild(sub);

    li.appendChild(avatar);
    li.appendChild(meta);

    li.addEventListener("click", () => selectTutor(t.id));

    tutorListEl.appendChild(li);
  });
}

// ========================
// Selección de tutor
// ========================
let selectedTutorId = null;

function selectTutor(id) {
  selectedTutorId = id;

  document
    .querySelectorAll(".tutor-item")
    .forEach((el) => el.classList.remove("active"));
  const el = document.querySelector(`.tutor-item[data-id="${id}"]`);
  if (el) el.classList.add("active");

  const tutor = tutors.find((t) => t.id === id);
  if (tutor) {
    tutorNameHeader.textContent = tutor.name;

    messagesDiv.innerHTML = "";
    tutor.messages.forEach((m) => {
      renderMessage(m.from === "student" ? "student" : "tutor", m.text, m.time, m.from === "student" ? "Tú" : tutor.name);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// ========================
// Filtros y arranque
// ========================
tutorSearch.addEventListener("input", (e) => {
  renderTutors(e.target.value);
});

renderRecents();
renderTutors();
if (tutors.length > 0) selectTutor(tutors[0].id);
