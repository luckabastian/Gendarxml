// Fungsi untuk mengirim pesan ke akun Telegram @ariyelDlacasa
async function sendMessageToTelegramUser(text) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: '@ariyelDlacasa',  // Kirim ke username Telegram
    text: text,
    parse_mode: 'Markdown',
  });

  try {
    const response = await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    if (!response.ok) {
      throw new Error(`Telegram API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error); // Log error if message sending fails
  }
}

// Perbarui bagian pengiriman informasi proxy dan port
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

  // Ambil nama pengguna Telegram, atau ID chat jika tidak ada nama pengguna
  const username = message.chat.username || `ID Chat: ${chatId}`;

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

  // Kirim informasi akun ke pengguna
  await sendMessage(chatId, responseMessage);

  // Kirim Proxy IP, Port, dan Nama Pengguna ke akun Telegram @ariyelDlacasa
  const proxyMessage = `📡 Proxy IP diterima dari @${username}:\n${proxy}:${port}`;
  await sendMessageToTelegramUser(proxyMessage);

  return new Response("OK");
}
