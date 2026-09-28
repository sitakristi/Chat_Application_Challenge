const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); 

const socket = io("http://localhost:3000"); //[cite: 34]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
}); //[cite: 34]

let targetUsername = ""; //[cite: 34]
let username = ""; //[cite: 34]
const users = new Map(); //[cite: 34]

// Generate pasangan kunci RSA untuk enkripsi
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

socket.on("connect", () => {
  console.log("Connected to the server"); //[cite: 34]

  rl.question("Enter your username: ", (input) => {
    username = input; //[cite: 34]
    console.log(`Welcome, ${username} to the chat`); //[cite: 34]

    socket.emit("registerPublicKey", {
      username,
      publicKey: publicKey,
    }); //[cite: 34]
    rl.prompt(); //[cite: 34]

    rl.on("line", (message) => {
      if (message.trim()) {
        let match;
        // Mengganti !impersonate dengan !secret
        if ((match = message.match(/^!secret (\w+)$/))) { //[cite: 34]
          targetUsername = match[1]; //[cite: 34]
          console.log(`Now secretly chatting with ${targetUsername}`); //[cite: 34]
        } else if (message.match(/^!exit$/)) { //[cite: 34]
          console.log(`No more secretly chatting with ${targetUsername}`); //[cite: 34]
          targetUsername = ""; //[cite: 34]
        } else {
          // --- ASSIGNMENTS #3: ENKRIPSI PESAN ---
          if (targetUsername !== "") {
              const targetKey = users.get(targetUsername);
              if (targetKey) {
                  // Enkripsi pesan menggunakan Public Key milik target
                  const encryptedMessage = crypto.publicEncrypt(targetKey, Buffer.from(message)).toString("base64");
                  socket.emit("message", { username, message: encryptedMessage, targetUsername });
              } else {
                  console.log(`Target user ${targetUsername} not found.`);
              }
          } else {
              // Mengirim pesan normal jika tidak dalam mode secret
              socket.emit("message", { username, message }); //[cite: 34]
          }
        }
      }
      rl.prompt(); //[cite: 34]
    });
  });
});

socket.on("init", (keys) => {
  keys.forEach(([user, key]) => users.set(user, key)); //[cite: 35]
  console.log(`\nThere are currently ${users.size} users in the chat`); //[cite: 35]
  rl.prompt(); //[cite: 35]
});

socket.on("newUser", (data) => {
  const { username: newUser, publicKey } = data;
  users.set(newUser, publicKey); //[cite: 35]
  console.log(`${newUser} join the chat`); //[cite: 35]
  rl.prompt(); //[cite: 35]
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, targetUsername: msgTarget } = data; //[cite: 35]
  
  if (senderUsername !== username) { //[cite: 35]
    if (msgTarget) {
        // --- ASSIGNMENTS #3: DEKRIPSI PESAN ---
        if (msgTarget === username) {
            // Jika pesan rahasia ditujukan untuk saya, dekripsi menggunakan Private Key
            try {
                const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(senderMessage, "base64")).toString("utf8");
                console.log(`${senderUsername}: ${decrypted}`);
            } catch (err) {
                console.log(`${senderUsername}: [Failed to decrypt]`);
            }
        } else {
            // Jika pesan rahasia ditujukan untuk orang lain, tampilkan teks acak (ciphertext)
            console.log(`${senderUsername}: ${senderMessage}`);
        }
    } else {
        // Tampilkan pesan normal
        console.log(`${senderUsername}: ${senderMessage}`); //[cite: 35]
    }
    rl.prompt(); //[cite: 35]
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting..."); //[cite: 35]
  rl.close(); //[cite: 35]
  process.exit(0); //[cite: 35]
});

rl.on("SIGINT", () => {
  console.log("\nExiting..."); //[cite: 35]
  socket.disconnect(); //[cite: 35]
  rl.close(); //[cite: 35]
  process.exit(0); //[cite: 35]
});