"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketTest() {
  useEffect(() => {
    const socket = io("http://127.0.0.1:8080", {
      transports: ["websocket", "polling"], 
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WS:", socket.id);
    });

    socket.on("hello", (data) => {
      console.log("👋 Server hello:", data);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ connect_error:", err?.message ?? err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>WebSocket test page</div>;
}
