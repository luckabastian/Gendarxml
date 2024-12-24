const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const serverwildcard = 'gendarbot.ari-andikha.web.id';
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
    const messageId = message.message_id;

    if (data.callback_query) {
      const callbackData = data.callback_query.data;
      if (callbackData.startsWith('confirm_trojan_')) {
        const [ip, port] = callbackData.split('_').slice(2);
        const responseMessage = generateTrojanConfig(ip, port);
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, responseMessage);
      } else if (callbackData.startsWith('confirm_vless_')) {
        const [ip, port] = callbackData.split('_').slice(2);
        const responseMessage = generateVlessConfig(ip, port);
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, responseMessage);
      } else if (callbackData.startsWith('cancel')) {
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, 'Proses dibatalkan.');
      }
    } else {
      const ipAddress = message.text.trim();
      const [ip, port] = ipAddress.includes(':') ? ipAddress.split(':') : [ipAddress, '443'];

      if (!validateIP(ip) || !validatePort(port)) {
        return sendMessage(
          chatId,
          '⚡ **Easy Create VLESS and Trojan Serverless** ⚡\n\nKirim IP dan port dengan format: `<IP>:<Port>`\nContoh: `192.168.1.1:443`\nJika port tidak disertakan, akan digunakan port default: `443`.'
        );
      }

      const proxyMessage = `
🌐 **Proxy Detected** 🌐
IP: ${ip}
Port: ${port}

Pilih jenis konfigurasi:
  1️⃣ **Trojan**
  2️⃣ **VLESS**
`;
      const buttons = [
        { text: 'Trojan', callback_data: `confirm_trojan_${ip}_${port}` },
        { text: 'VLESS', callback_data: `confirm_vless_${ip}_${port}` },
        { text: 'Batalkan', callback_data: `cancel` },
      ];

      return sendInlineKeyboard(chatId, proxyMessage, buttons);
    }
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' });
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
}

async function sendInlineKeyboard(chatId, text, buttons) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: text,
    reply_markup: { inline_keyboard: [buttons] },
    parse_mode: 'Markdown',
  });
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
}

async function deleteMessage(chatId, messageId) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
  const body = JSON.stringify({ chat_id: chatId, message_id: messageId });
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
}

function validateIP(ip) {
  const parts = ip.split('.');
  return parts.length === 4 && parts.every(part => !isNaN(part) && +part >= 0 && +part <= 255);
}

function validatePort(port) {
  const num = parseInt(port, 10);
  return !isNaN(num) && num >= 1 && num <= 65535;
}

function generateTrojanConfig(ip, port) {
  return `
🔐 **Trojan Config**
- Server: ${servertrojan}
- Port: ${port}
- UUID: ${passuid}
- Path: \`/trojan/${ip}:${port}\`

🌍 **Clash Configuration**:
\`\`\`
proxies:
  - name: Trojan-${ip}
    type: trojan
    server: ${servertrojan}
    port: ${port}
    password: ${passuid}
    network: ws
    skip-cert-verify: true
    ws-opts:
      path: /trojan/${ip}:${port}
      headers:
        Host: ${servertrojan}
\`\`\`
`;
}

function generateVlessConfig(ip, port) {
  return `
🔐 **VLESS Config**
- Server: ${servervless}
- Port: ${port}
- UUID: ${passuid}
- Path: \`/vless/${ip}:${port}\`

🌍 **Clash Configuration**:
\`\`\`
proxies:
  - name: VLESS-${ip}
    type: vless
    server: ${servervless}
    port: ${port}
    uuid: ${passuid}
    cipher: auto
    network: ws
    tls: true
    skip-cert-verify: true
    ws-opts:
      path: /vless/${ip}:${port}
      headers:
        Host: ${servervless}
\`\`\`
`;
}
