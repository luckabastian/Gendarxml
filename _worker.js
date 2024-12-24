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
    const message = data.message || data.callback_query.message;
    const chatId = message.chat.id;
    const messageText = message.text?.trim();

    // Jika pesan berupa teks
    if (messageText) {
      const [ip, port] = messageText.includes(':') ? messageText.split(':') : [messageText, '443'];

      // Validasi IP dan Port
      if (!validateIP(ip) || !validatePort(port)) {
        return sendMessage(chatId, `⚠️ Format salah! Gunakan: <IP>:<Port>\nContoh: \`192.168.1.1:443\`\nJika port tidak disebutkan, bot akan menggunakan default: 443.`);
      }

      // Buat konfigurasi VLESS dan Trojan
      const vlessConfig = generateVlessLink(ip, port);
      const trojanConfig = generateTrojanLink(ip, port);

      const responseMessage = `
✅ **Konfigurasi Akun Berhasil Dibuat** ✅

🌐 **VLESS**:
\`\`\`
${vlessConfig}
\`\`\`

🌐 **Trojan**:
\`\`\`
${trojanConfig}
\`\`\`

Gunakan konfigurasi ini untuk menghubungkan ke server Anda!
`;

      // Kirim hasil konfigurasi ke user
      return sendMessage(chatId, responseMessage, true);
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}

// Fungsi untuk membuat konfigurasi VLESS
function generateVlessLink(ip, port) {
  return `vless://${passuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=/vless/${ip}:${port}#VLESS-${ip}`;
}

// Fungsi untuk membuat konfigurasi Trojan
function generateTrojanLink(ip, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=/trojan/${ip}:${port}#TROJAN-${ip}`;
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text, isMarkdown = false) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: isMarkdown ? 'Markdown' : 'HTML'
  };
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

// Fungsi untuk validasi IP
function validateIP(ip) {
  const ipParts = ip.split('.');
  return ipParts.length === 4 && ipParts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// Fungsi untuk validasi Port
function validatePort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}
