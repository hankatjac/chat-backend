const express = require("express");

const app = express();

const httpServer = require("http").createServer(app);


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Exel-Tech chat application." });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT || 5000, () => console.log(`Server is running on port ${PORT}.`));

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8081",
    methods: ["GET", "POST"]
  }
});

io.on('connection', socket => {
  const id = socket.handshake.query.id
  socket.join(id)

  socket.on('send-message', ({ recipients, text }) => {
    recipients.forEach(recipient => {
      const newRecipients = recipients.filter(r => r !== recipient)
      newRecipients.push(id)
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients, sender: id, text
      })
    })
  })
})

