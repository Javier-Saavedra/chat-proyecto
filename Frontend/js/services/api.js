async function loginRequest(username, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Credenciales incorrectas");
  return res.json();
}

async function fetchUsers() {
  const res = await fetch("/api/users");
  return res.json();
}
