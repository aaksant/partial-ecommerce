import express from "express";
import routes from "./routes/index.route";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Mount Better Auth
app.all("/api/auth/*path", toNodeHandler(auth));

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log("Server started successfully!");
  console.log("");
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("Available endpoints:");
  console.log("");
  console.log("Chat: GET /api/chat/conversations");
  console.log("");
  console.log("Env:", process.env.NODE_ENV || "development");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
