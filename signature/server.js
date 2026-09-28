const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server);

// Menyimpan daftar username dan public key
const users = new Map(); //[cite: 26, 30]

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`); //[cite: 30]

  // Kirim daftar user yang sudah ada ke client baru
  socket.emit("init", Array.from(users.entries())); //[cite: 27, 30]

  socket.on("registerPublicKey", (data) => {
    const { username, publicKey } = data; //[cite: 31]
    users.set(username, publicKey); //[cite: 26, 31]
    console.log(`${username} registered with public key.`); //[cite: 31]

    // Beritahu semua client ada user baru
    io.emit("newUser", { username, publicKey }); //[cite: 28, 31]
  });

  socket.on("message", (data) => {
    // Meneruskan pesan beserta signature RSA-nya
    const { username, message, signature } = data; 
    io.emit("message", { username, message, signature }); //[cite: 31]
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`); //[cite: 31]
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`); //[cite: 31]
});