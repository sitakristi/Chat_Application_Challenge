## Tugas AFL 2 Cyber Security: Chat Application Challenge

Proyek ini merupakan implementasi aplikasi obrolan *client-server* berbasis Node.js dan Socket.io yang mendemonstrasikan kerentanan jaringan serta mitigasinya melalui konsep kriptografi. Struktur repositori ini dipecah menjadi empat tahapan iteratif untuk menunjukkan peningkatan lapisan keamanan secara bertahap.

### Modul Praktikum
* **Base:** Aplikasi obrolan fungsional dasar tanpa lapisan keamanan tambahan, rentan terhadap manipulasi dan penyadapan.
* **Hash (Malicious Server):** Simulasi *server* jahat yang mencegat dan menyisipkan modifikasi pada pesan. Mitigasi diimplementasikan menggunakan algoritma *hash* SHA-256 pada sisi *client* untuk memverifikasi integritas data dan mendeteksi perubahan selama transmisi.
* **Signature (Impersonation):** Simulasi celah keamanan di mana *user* (Trudy) memalsukan identitas *user* lain (Alice). Pencegahan dilakukan dengan mengimplementasikan sistem verifikasi Tanda Tangan Digital RSA.
* **Encryption (Secret Messages):** Implementasi enkripsi pesan asimetris (RSA). Pesan rahasia antar pengguna dienkripsi menggunakan *Public Key* milik target, memastikan hanya penerima yang sah yang dapat melakukan dekripsi menggunakan *Private Key* mereka. Pihak ketiga hanya akan melihat *ciphertext* yang tidak dapat dibaca.

### Instruksi Instalasi dan Pengujian
1. Pastikan *environment* Node.js sudah terinstal di sistem.
2. Kloning repositori ini dan jalankan perintah `npm install` pada direktori utama untuk mengunduh dependensi (`socket.io`, `socket.io-client`).
3. Buka direktori modul yang ingin diuji secara spesifik (contoh: `cd encryption`).
4. Inisialisasi *server* pada satu terminal utama menggunakan perintah `node server.js`.
5. Inisialisasi dua atau lebih *client* pada terminal terpisah menggunakan perintah `node client.js` untuk mulai menguji skenario keamanan.

### Dokumentasi Demonstrasi
* **Video Demo Sesi 1 - 4:** https://youtu.be/adLd9vZJAZ0
* **Dikembangkan oleh:** Rasita Kristi Ulliyani
