import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { config } from "./config.js";
import { CallSession } from "./session.js";

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

const wss = new WebSocketServer({ server, path: "/media-stream" });

wss.on("connection", (ws) => {
  console.log("Twilio media stream connected");
  new CallSession(ws);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("Voice server error", err.code ?? err.message);
  process.exit(1);
});

server.listen(config.port, () => {
  console.log(`Voice bridge listening on :${config.port} (ws path /media-stream)`);
});
