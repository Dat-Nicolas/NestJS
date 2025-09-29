import { io } from "socket.io-client";

const URL = "http://localhost:8080"; // đổi theo BE
const socket = io(URL, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ connected:", socket.id);
  socket.emit("ping", { hello: "server" });
  socket.emit("join", "room1");
  setTimeout(() => socket.emit("say", { room: "room1", msg: "Xin chào!" }), 500);
});

socket.on("pong", (d) => console.log("📩 pong:", d));
socket.on("joined", (r) => console.log("📌 joined:", r));
socket.on("message", (m) => console.log("💬 message:", m));
socket.on("connect_error", (e) => console.error("❌ connect_error:", e.message));
socket.on("disconnect", (r) => console.log("🔌 disconnect:", r));
