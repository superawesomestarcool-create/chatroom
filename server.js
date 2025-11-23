const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// === In-memory message history ===
const MAX_HISTORY = 100;
let messageHistory = [];

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send chat history (now with username+text or old strings)
    socket.emit("chatHistory", messageHistory);

    socket.on("chatMessage", (msg) => {
        // msg can be:
        //  - plain string (old format)
        //  - { username: "...", text: "..." } (new format)

        let formatted;

        if (typeof msg === "string") {
            // Old-style message fallback
            formatted = { username: "Unknown", text: msg };
        } else if (msg && typeof msg === "object") {
            // New format cleanup
            formatted = {
                username: msg.username || "Unknown",
                text: msg.text || ""
            };
        } else {
            // Fallback for unexpected payloads
            formatted = { username: "Unknown", text: String(msg) };
        }

        // Save to history and enforce max length
        messageHistory.push(formatted);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory = messageHistory.slice(-MAX_HISTORY);
        }

        // Broadcast to all clients
        io.emit("chatMessage", formatted);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});