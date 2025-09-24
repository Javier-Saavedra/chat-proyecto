const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const user = await loginRequest(username, password);
    localStorage.setItem("user", JSON.stringify(user));
    redirectToChat();
  } catch (err) {
    showError(err.message);
  }
});
