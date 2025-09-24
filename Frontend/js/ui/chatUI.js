function addMessage(username, text) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${username}</strong>: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function updateUserList(users) {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.status})`;
    userList.appendChild(li);
  });
}
