// backend/server.js (versión con logs de depuración)
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Mostrar variables cargadas (solo el CLIENT_ID para no exponer secret en consola)
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID ? "OK" : "MISSING");
console.log("GOOGLE_CALLBACK_URL =", process.env.GOOGLE_CALLBACK_URL);

// Sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave_secreta",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // LOG para saber si la estrategia fue invocada
      console.log("GoogleStrategy callback invoked for:", profile && profile.emails && profile.emails[0] ? profile.emails[0].value : profile.id);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((obj, done) => { done(null, obj); });

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// si falla, vamos a /auth/failure para ver el error
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    console.log("Auth success, user:", req.user && req.user.displayName);
    res.redirect("/chat.html");
  }
);

app.get("/auth/failure", (req, res) => {
  // Muestra algo fácil para debug en el navegador
  res.status(401).send("Autenticación fallida. Revisa consola del servidor para más detalles.");
});

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Socket.io
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado:", socket.id);
  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });
  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado:", socket.id);
  });
});
// Ruta raíz -> siempre devuelve login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
