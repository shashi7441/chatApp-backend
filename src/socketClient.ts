const http = require("http");

const { Server } = require("socket.io");
const server = http.createServer();

server.listen(8050);
console.log("server listen on", server.address().port);
const io = new Server(server, {
  cors: {
    origin: true,
  },
})

io.on("connection", () => {
  console.log("connected");
});
