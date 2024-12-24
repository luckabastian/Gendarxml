const servervless = 'vless.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = 'AKUN-GENDAR-ORI';  // Ganti dengan ID yang sesuai
const TELEGRAM_BOT_TOKEN = '7813433823:AAG23Gu9rPzEASZPqIPE9pQXzR4louLV-gY';

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

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Contoh:
192.168.1.1:443

Untuk mencari informasi proxy aktif, Anda bisa mengunjungi:
[Daftar Proxy Aktif](https://github.com/Gendarxml/Nautica/blob/main/proxyList.txt)

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

        // Generate akun VLESS dan Trojan dengan format yang diminta
        const vlessLinks = generateVlessLinks(proxy, port);
        const trojanLink = generateTrojanLink(proxy, port);

        const responseMessage = `
=========VLESS=========
CF VLESS CONFIGURATION
=========VLESS=========
        
VLESS TLS
\`${vlessLinks.tls}\`

VLESS NTLS
\`${vlessLinks.ntls}\`

CLASH VLESS
\`\`\`
proxies:
- name: Pt Cloud Hosting Indonesia 🇮🇩
  server: ${servervless}
  port: 443
  type: vless
  uuid: ${passuid}
  cipher: auto
  tls: true
  skip-cert-verify: true
  network: ws
  servername: ${servervless}
  ws-opts:
    path: /vless=${proxy}=${port}
    headers:
      Host: ${servervless}
  udp: true
\`\`\`

=========TROJAN=========
Trojan Link
\`${trojanLink}\`

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

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text) {
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

// Generate VLESS Links
function generateVlessLinks(proxy, port) {
  const tlsLink = `vless://${passuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=%2Fvless%3D${proxy}%3D${port}#Pt%20Cloud%20Hosting%20Indonesia%20🇮🇩`;
  const ntlsLink = `vless://${passuid}@${servervless}:80?path=%2Fvless%3D${proxy}%3D${port}&security=none&encryption=none&host=${servervless}&fp=randomized&type=ws&sni=${servervless}#Pt%20Cloud%20Hosting%20Indonesia%20🇮🇩`;

  return { tls: tlsLink, ntls: ntlsLink };
}

// Generate Trojan Link
function generateTrojanLink(proxy, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2F${proxy}%3A${port}#Trojan_${proxy}`;
}
