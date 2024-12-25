const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_USER_ID = 'YOUR_USER_ID'; // Nama Telegram pengguna

// Menyimpan ID chat pengguna yang sudah menerima pesan kesalahan
const usersWithError = new Set();

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    if (request.method === 'POST') {
      const data = await request.json();
      const message = data.message || data.callback_query?.message;
      const chatId = message.chat.id;
      const text = message.text?.trim();

      console.log(`Received message: ${text}`); // Logging the incoming message

      // Kata sambutan untuk perintah /start
      if (text === "/start") {
        const welcomeMessage = `
🎉 Selamat datang di Bot Akun VLESS dan Trojan! 🎉

👤 Bot ini dioperasikan oleh @ariyelDlacasa.

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)

Silakan kirim proxy dan port sekarang!
`;

        // Kirim sambutan tanpa foto
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
✅ Berikut informasi proxy Anda:

🌍 **Alamat Proxy**: ${proxy}
⏱️ **Status**: Aktif
🔌 **Ping**: 20ms
🗺️ **Lokasi**: Jakarta, Indonesia

------------------------------------

🔹 [Ambil Akun Trojan](https://t.me/${TELEGRAM_USER_ID}?start=trojan-${proxy}-${port})
🔹 [Ambil Akun VLESS](https://t.me/${TELEGRAM_USER_ID}?start=vless-${proxy}-${port})
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

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text, photoUrl = null) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" });
  
  try {
    const response = await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    if (!response.ok) {
      throw new Error(`Telegram API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error); // Log error if message sending fails
  }
}

// Validasi Proxy (IP Address)
function validateIP(ip) {
  const ipParts = ip.split(".");
  return ipParts.length === 4 && ipParts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// Validasi Port
function validatePort(port) {
  const num = parseInt(port, 10);
  return num >= 1 && num <= 65535;
}

// Generate VLESS Link dengan nama Telegram
function generateVlessLink(proxy, port) {
  return `vless://${passuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=%2F${proxy}%3A${port}#${proxy}`;
}

// Generate Trojan Link dengan nama Telegram
function generateTrojanLink(proxy, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2F${proxy}%3A${port}#${proxy}`;
}
