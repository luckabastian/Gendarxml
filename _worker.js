const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const data = await request.json();
    const message = data.message || data.callback_query?.message;
    const chatId = message?.chat?.id;
    const messageId = message?.message_id;

    if (data.callback_query) {
      const callbackData = data.callback_query.data;
      const [action, ip, port, isp, countryCode] = callbackData.split('_');
      if (action === 'confirm_trojan') {
        const responseMessage = generateTrojanLink(ip, port, isp, countryCode);
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, responseMessage);
      } else if (action === 'confirm_vless') {
        const responseMessage = generateVlessLink(ip, port, isp, countryCode);
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, responseMessage);
      } else if (action === 'cancel') {
        await deleteMessage(chatId, messageId);
        return sendMessage(chatId, 'Proses dibatalkan.');
      }
    } else {
      const ipAddress = message?.text?.trim();
      const [ip, port = '443'] = ipAddress?.split(':') || [];

      if (!validateIP(ip) || !validatePort(port)) {
        return sendMessage(chatId, 'Format IP atau port tidak valid. Silakan kirim dengan format: <IP>:<Port>');
      }

      const checkUrl = `https://ipcheck.proxybox.us.kg/json?ip=${ip}&port=${port}`;
      try {
        const response = await fetch(checkUrl);
        const data = await response.json();

        if (data.status === "success" && data.proxyInfo.isProxy) {
          const proxyMessage = `
          Proxy Host: ${ip}
          Proxy Port: ${port}
          ISP: ${data.isp}
          Negara: ${data.country} (${data.countryCode})
          Status Proxy: Aktif
          Latency: ${data.proxyInfo.latency}

          Apakah Anda ingin melanjutkan dengan tautan Trojan atau VLESS?
          `;
          const buttons = [
            { text: "Trojan", callback_data: `confirm_trojan_${ip}_${port}_${data.isp}_${data.countryCode}` },
            { text: "VLESS", callback_data: `confirm_vless_${ip}_${port}_${data.isp}_${data.countryCode}` },
            { text: "Tidak", callback_data: `cancel_${ip}_${port}` }
          ];
          return sendInlineKeyboard(chatId, proxyMessage, buttons);
        } else {
          return sendMessage(chatId, 'Proxy tidak aktif atau tidak valid. Silakan coba IP dan port lain.');
        }
      } catch (error) {
        return sendMessage(chatId, 'Error saat memeriksa status proxy.');
      }
    }
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}

async function sendMessage(chatId, text) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: text });
  await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
  return new Response('OK', { status: 200 });
}

async function sendInlineKeyboard(chatId, text, buttons) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: text,
    reply_markup: { inline_keyboard: [buttons] }
  });
  await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
  return new Response('OK', { status: 200 });
}

async function deleteMessage(chatId, messageId) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
  const body = JSON.stringify({ chat_id: chatId, message_id: messageId });
  await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
}

function validateIP(ip) {
  const ipParts = ip.split('.');
  if (ipParts.length !== 4) return false;
  for (let part of ipParts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return false;
  }
  return true;
}

function validatePort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
