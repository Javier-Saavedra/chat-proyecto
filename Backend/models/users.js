const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../data/users.json");

function getUsers() {
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function findUser(username, password) {
  const users = getUsers();
  return users.find((u) => u.username === username && u.password === password);
}

function updateUserStatus(username, status) {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (user) {
    user.status = status;
    saveUsers(users);
  }
}

module.exports = { getUsers, saveUsers, findUser, updateUserStatus };
