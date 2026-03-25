import { Server as WebSocketServer } from "ws";
import { getEvents, CONTRACT_ID } from "./utils/stellar.js";
import { prisma } from "./index.js";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export function startEventPolling(wss: WebSocketServer) {
  setInterval(async () => {
    try {
      const events = await getEvents();
      for (const event of events) {
        // Process events like book_add, book_brw, book_ret
        if (event.event === "book_add") {
          // Update DB if needed
          logger.info("Book added event:", event);
          // Broadcast to WS clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // OPEN
              client.send(JSON.stringify({ type: "book_added", data: event }));
            }
          });
        }
        // Similarly for borrow/return
      }
    } catch (err) {
      logger.error("Event polling error:", err);
    }
  }, 30000); // Poll every 30 seconds
}