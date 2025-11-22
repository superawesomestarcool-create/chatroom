const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg); // broadcast to everyone
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

http.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
