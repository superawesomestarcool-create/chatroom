const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// === In-memory message history ===
const MAX_HISTORY = 100;          // how many messages to keep
let messageHistory = [];          // store past messages

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // === Send message history to user upon connection ===
    socket.emit("chatHistory", messageHistory);

    socket.on("chatMessage", (msg) => {
        // Save the message in history
        messageHistory.push(msg);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.shift();   // remove oldest
        }

        // Broadcast message to all users
        io.emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Render or local port
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
