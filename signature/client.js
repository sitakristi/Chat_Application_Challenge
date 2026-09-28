const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); // Modul RSA

const socket = io("http://localhost:3000"); //[cite: 24]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
}); //[cite: 24]

let registeredUsername = "";
let username = "";
const users = new Map(); //[cite: 28]

// Buat kunci RSA (Private & Public) untuk client ini
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

socket.on("connect", () => {
  console.log("Connected to the server"); //[cite: 24]

  rl.question("Enter your username: ", (input) => {
    username = input;
    registeredUsername = input;
    console.log(`Welcome, ${username} to the chat`);

    // Daftarkan username dan Public Key asli ke server
    socket.emit("registerPublicKey", {
      username,
      publicKey: publicKey, 
    }); //[cite: 27]
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        let match;
        if ((match = message.match(/^!impersonate (\w+)$/))) {
          username = match[1]; //[cite: 29, 30]
          console.log(`Now impersonating as ${username}`); //[cite: 29, 30]
        } else if (message.match(/^!exit$/)) {
          username = registeredUsername; //[cite: 29, 30]
          console.log(`Now you are ${username}`); //[cite: 29, 30]
        } else {
          // Tandatangani pesan dengan Private Key sebelum dikirim
          const sign = crypto.createSign("sha256");
          sign.update(message);
          sign.end();
          const signature = sign.sign(privateKey, "hex");

          socket.emit("message", { username, message, signature });
        }
      }
      rl.prompt();
    });
  });
});

socket.on("init", (keys) => {
  keys.forEach(([user, key]) => users.set(user, key)); //[cite: 28]
  console.log(`\nThere are currently ${users.size} users in the chat`); //[cite: 28]
  rl.prompt();
});

socket.on("newUser", (data) => {
  const { username, publicKey } = data;
  users.set(username, publicKey); //
  console.log(`${username} join the chat`); //[cite: 29]
  rl.prompt();
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, signature } = data;
  if (senderUsername !== username) { //[cite: 25]

    // --- Verifikasi RSA untuk Assignments #2 ---
    const senderPublicKey = users.get(senderUsername);
    let isValid = false;

    if (senderPublicKey && signature) {
        try {
            const verify = crypto.createVerify("sha256");
            verify.update(senderMessage);
            verify.end();
            isValid = verify.verify(senderPublicKey, signature, "hex");
        } catch (e) {
            isValid = false;
        }
    }

    if (isValid) {
        console.log(`${senderUsername}: ${senderMessage}`); //[cite: 25]
    } else {
        console.log(`[WARNING]: this user is fake`);
        console.log(`${senderUsername}: ${senderMessage}`);
    }
    rl.prompt();
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting..."); //[cite: 25]
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting..."); //[cite: 25]
  socket.disconnect();
  rl.close();
  process.exit(0);
});