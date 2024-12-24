// Fungsi untuk menangani request POST
async function handleRequest(request) {
  try {
    if (request.method === 'POST') {
      const data = await request.json();
      const message = data.message || data.callback_query?.message;
      const chatId = message.chat.id;
      const text = message.text?.trim();
      const userName = message.from.username || "Tidak ada nama"; // Menyimpan username Telegram
      const userPhone = message.contact ? message.contact.phone_number : "Tidak ada nomor"; // Menyimpan nomor Telegram

      console.log(`Received message: ${text}`); // Logging the incoming message

      // Kirim informasi nama dan nomor pengguna ke @ariyeldlacasa
      const notifyMessage = `
👤 Pengguna meminta akun:
- Nama: ${userName}
- Nomor Telegram: ${userPhone}
- Pesan yang dikirim: ${text}
`;
      await sendMessage(TELEGRAM_USER_ID, notifyMessage); // Kirim informasi ke @ariyeldlacasa

      // Kata sambutan untuk perintah /start
      if (text === "/start") {
        const welcomeMessage = `
🎉 Selamat datang di Bot Akun VLESS dan Trojan! 🎉

👤 Bot ini dioperasikan oleh @ariyelDlacasa.

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Contoh:
192.168.1.1:443

Klik di bawah untuk mencari proxy aktif:
[Daftar Proxy Aktif](https://github.com/Gendarxml/Cek-domain/blob/main/genarate-url.js)

Silakan kirim proxy dan port sekarang!
`;

        // Kirim sambutan tanpa foto, tetap mempertahankan link GitHub
        await sendMessage(chatId, welcomeMessage);
        return new Response("OK");
      }

      // Jika format input adalah Proxy:Port
      if (text?.includes(":")) {
        const [proxy, port] = text.split(":");
        if (!validateIP(proxy) || !validatePort(port)) {
          // Hanya kirim pesan kesalahan jika pengguna belum menerima pesan kesalahan
          if (!usersWithError.has(chatId)) {
            await sendMessage(chatId, `❌ Format salah! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
            usersWithError.add(chatId);  // Tandai pengguna yang sudah menerima pesan kesalahan
          }
          return new Response("OK");
        }

        // Generate akun Trojan dan VLESS dengan nama ID Telegram
        const vlessLink = generateVlessLink(proxy, port);
        const trojanLink = generateTrojanLink(proxy, port);

        const responseMessage = `
✅ Berikut akun Anda:

🔹 **Trojan Link**:
\`\`\`
${trojanLink}
\`\`\`
------------------------------------

🔹 **VLESS Link**:
\`\`\`
${vlessLink}
\`\`\`
------------------------------------

Selamat menggunakan akun Anda!
`;
        await sendMessage(chatId, responseMessage);
        return new Response("OK");
      }

      // Jika format tidak dikenali
      await sendMessage(chatId, `❌ Format tidak dikenali! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
      return new Response("OK");
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    console.error('Error processing request:', error); // Improved error logging
    return new Response("Internal Server Error", { status: 500 });
  }
}
