const express = require("express");

const app = express();

const httpServer = require("http").createServer(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Exel-Tech chat application." });
});

const PORT = process.env.PORT || 50000;

httpServer.listen(PORT || 50000, () =>
  console.log(`Server is running on port ${PORT}.`)
);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: [
      "https://www.exel-tech.com",
      "https://exel-tech.com",
      "http://www.exel-tech.com",
      "http://exel-tech.com",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);

  if (id == "Admin") {
    socket.broadcast.emit("admin-connected");
  } else {
    if (socket.adapter.rooms.has("Admin")) {
      io.to(id).emit("admin-connected");
    } else {
      io.to(id).emit("admin-disconnected");
    }
    socket.broadcast.to("Admin").emit("user-connected", id);
  }

  socket.on("send-message", ({ recipients, text }) => {
    recipients.forEach((recipient) => {
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id);
      socket.broadcast.to(recipient).emit("receive-message", {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  });

  socket.on("disconnect", () => {
    if (id == "Admin") {
      socket.broadcast.emit("admin-disconnected");
    }
    socket.broadcast.to("Admin").emit("user-disconnected", id);
  });
});
