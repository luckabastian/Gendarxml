const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = '7961283450:AAGvj_tjUn4kGwQzruOepP-3S32uTqpoKto';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const data = await request.json();
    const message = data.message || data.callback_query?.message;
    const chatId = message.chat.id;
    const text = message.text?.trim();

    // Kata sambutan untuk perintah /start
    if (text === "/start") {
      const welcomeMessage = `
🎉 Selamat datang di Bot Akun VLESS dan Trojan! 🎉

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Contoh:
192.168.1.1:443

Silakan kirim proxy dan port sekarang!
`;
      await sendMessage(chatId, welcomeMessage);
      return new Response("OK");
    }

    // Jika format input adalah Proxy:Port
    if (text?.includes(":")) {
      const [proxy, port] = text.split(":");
      if (!validateIP(proxy) || !validatePort(port)) {
        return sendMessage(chatId, `❌ Format salah! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
      }

      // Generate akun Trojan dan VLESS
      const vlessLink = generateVlessLink(proxy, port);
      const trojanLink = generateTrojanLink(proxy, port);

      const responseMessage = `
✅ Berikut akun Anda:

🔹 **Trojan Link**:
\`${trojanLink}\`

🔹 **VLESS Link**:
\`${vlessLink}\`

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
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" });
  await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
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

// Generate VLESS Link
function generateVlessLink(proxy, port) {
  return `vless://${passuid}@${servervless}:${port}?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=%2Fvl%3D${encodeURIComponent(proxy)}:${port}#VLESS_${proxy}`;
}

// Generate Trojan Link
function generateTrojanLink(proxy, port) {
  return `trojan://${passuid}@${servertrojan}:${port}?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2Ftrojan%3D${encodeURIComponent(proxy)}:${port}#Trojan_${proxy}`;
}
