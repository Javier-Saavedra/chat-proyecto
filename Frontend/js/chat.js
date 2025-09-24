const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const msg = input.value.trim();
  if (msg) {
    chatSocket.send({ type: "chat", username: user.username, text: msg });
    input.value = "";
  }
}
