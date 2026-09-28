const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); // Menambahkan modul crypto untuk hash

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome, ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        // Membuat hash dari pesan sebelum dikirim
        const hash = crypto.createHash("sha256").update(message).digest("hex");
        socket.emit("message", { username, message, hash });
      }
      rl.prompt();
    });
  });
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, hash: senderHash } = data;
  
  if (senderUsername !== username) {
    // Memverifikasi hash pesan yang diterima
    const currentHash = crypto.createHash("sha256").update(senderMessage).digest("hex");

    if (currentHash === senderHash) {
      // Jika hash cocok, pesan aman
      console.log(`${senderUsername}: ${senderMessage}`);
    } else {
      // Jika hash tidak cocok, munculkan peringatan sesuai instruksi
      console.log(`[WARNING]: the message may have been changed during transmission`);
      console.log(`${senderUsername}: ${senderMessage}`);
    }
    rl.prompt();
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting...");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});