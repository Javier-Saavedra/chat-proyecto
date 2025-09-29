const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "../data/users.json");

function getUsers() {
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
}

function validateUser(username, password) {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password);
}

module.exports = { getUsers, validateUser };
