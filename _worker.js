addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const data = await request.json();
    const message = data.message || data.callback_query?.message;
    const chatId = message.chat.id;

    // Menangani pesan perintah (contoh: /start)
    if (message.text) {
      const text = message.text?.trim();
      
      // Jika pengguna mengirimkan perintah /start
      if (text === "/start") {
        const welcomeMessage = `
🎉 Selamat datang di Bot Akun VLESS dan Trojan! 🎉
👤 Bot ini dioperasikan oleh @ariyelDlacasa.

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Silakan kirim proxy dan port sekarang!
`;

        // Kirim sambutan
        await sendMessage(chatId, welcomeMessage);
        return new Response("OK");
      }

      // Memproses input Proxy:Port
      if (text?.includes(":")) {
        const [proxy, port] = text.split(":");
        if (!validateIP(proxy) || !validatePort(port)) {
          await sendMessage(chatId, `❌ Format salah! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
          return new Response("OK");
        }

        // Kirim status proxy aktif dan tombol untuk memilih akun
        await handleProxyStatus(chatId, proxy, port);
        return new Response("OK");
      }
    }

    // Menangani callback query (klik tombol)
    if (data.callback_query) {
      const callbackData = data.callback_query.data;
      const chatId = data.callback_query.message.chat.id;
      
      // Menangani callback untuk Trojan atau VLESS
      if (callbackData.startsWith('trojan_')) {
        const [_, proxy, port] = callbackData.split('_');
        const trojanLink = generateTrojanLink(proxy, port);
        await sendMessage(chatId, `✅ Berikut akun Trojan Anda:\n\n\`\`\`\n${trojanLink}\n\`\`\`\nSelamat menggunakan akun Trojan!`);
      } else if (callbackData.startsWith('vless_')) {
        const [_, proxy, port] = callbackData.split('_');
        const vlessLink = generateVlessLink(proxy, port);
        await sendMessage(chatId, `✅ Berikut akun VLESS Anda:\n\n\`\`\`\n${vlessLink}\n\`\`\`\nSelamat menggunakan akun VLESS!`);
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text, proxy = null, port = null) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { 
          text: "🔒 Ambil Trojan Account", 
          callback_data: `trojan_${proxy}_${port}` 
        },
        { 
          text: "🌐 Ambil VLESS Account", 
          callback_data: `vless_${proxy}_${port}` 
        }
      ]
    ]
  };

  const body = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: inlineKeyboard
  });

  try {
    const response = await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    if (!response.ok) {
      throw new Error(`Telegram API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

// Validasi Proxy dan Port
function validateIP(ip) {
  const ipParts = ip.split(".");
  return ipParts.length === 4 && ipParts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function validatePort(port) {
  const num = parseInt(port, 10);
  return num >= 1 && num <= 65535;
}

// Generate VLESS Link
function generateVlessLink(proxy, port) {
  return `vless://${passuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=%2F${proxy}%3A${port}#${TELEGRAM_USER_ID}`;
}

// Generate Trojan Link
function generateTrojanLink(proxy, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2F${proxy}%3A${port}#${TELEGRAM_USER_ID}`;
}

// Fungsi untuk memeriksa status proxy (mock)
async function checkProxyStatus(proxy, port) {
  // Lakukan pengecekan apakah proxy aktif atau tidak
  return true;  // Menganggap proxy aktif (ganti dengan logika pengecekan proxy yang sebenarnya)
}

// Menangani status proxy dan menampilkan tombol
async function handleProxyStatus(chatId, proxy, port) {
  const isProxyActive = await checkProxyStatus(proxy, port);

  if (isProxyActive) {
    const responseMessage = `
🔹 **Alamat Proxy**: ${proxy}
🌍 **Bendera**: 🇺🇸 (Contoh Bendera)
🏷️ **Nama Proxy**: gendarbot.ari-andikha.web.id
✅ **Status**: Aktif

📝 Berikut akun yang dapat digunakan:

🔹 **Trojan Link**:
trojan://6ac83a31-453a-45a3-b01d-1bd20ee9101f@gendarbot.ari-andikha.web.id:443?encryption=none&security=tls&sni=gendarbot.ari-andikha.web.id&fp=randomized&type=ws&host=gendarbot.ari-andikha.web.id&path=%2F${proxy}%3A${port}#ariyelDlacasa

🔹 **VLESS Link**:
vless://6ac83a31-453a-45a3-b01d-1bd20ee9101f@gendarbot.ari-andikha.web.id:443?encryption=none&security=tls&sni=gendarbot.ari-andikha.web.id&fp=randomized&type=ws&host=gendarbot.ari-andikha.web.id&path=%2F${proxy}%3A${port}#ariyelDlacasa

------------------------------------
👉 Pilih akun yang ingin Anda gunakan:

`;
    await sendMessage(chatId, responseMessage, proxy, port);
  } else {
    await sendMessage(chatId, `❌ Proxy tidak aktif. Coba periksa kembali alamat dan port.`);
  }
}
