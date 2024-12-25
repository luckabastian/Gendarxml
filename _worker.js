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
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Contoh:
192.168.1.1:443

Klik di bawah untuk mencari proxy aktif:
[Daftar Proxy Aktif](https://github.com/Gendarxml/BAHAN/blob/main/List%20Paket)

Silakan kirim proxy dan port sekarang!
`;

        await sendMessage(chatId, welcomeMessage);
        return new Response("OK");
      }

      // Jika format input adalah Proxy:Port
      if (text?.includes(":")) {
        const [proxy, port] = text.split(":");
        if (!validateIP(proxy) || !validatePort(port)) {
          if (!usersWithError.has(chatId)) {
            await sendMessage(chatId, `❌ Format salah! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
            usersWithError.add(chatId);
          }
          return new Response("OK");
        }

        // Mendapatkan informasi proxy
        try {
          const proxyInfo = await getProxyInfo(proxy);

          // Periksa nama proxy
          if (proxyInfo.isp === "DoD Network Information Center") {
            await sendMessage(chatId, `❌ Proxy berasal dari DoD Network Information Center. Silakan periksa kembali proxy Anda.`);
            return new Response("OK");
          }

          // Jika proxy aktif, kirimkan informasi beserta akun Trojan dan VLESS
          if (proxyInfo.status === 'active') {
            const vlessLink = generateVlessLink(proxy, port);
            const trojanLink = generateTrojanLink(proxy, port);

            const responseMessage = `
✅ Berikut akun Anda:

🔹 **Alamat Proxy**: ${proxyInfo.address}
🔹 **Nama Proxy**: ${proxyInfo.isp}
🔹 **Negara**: ${proxyInfo.country}
🔹 **Status Proxy**: Aktif

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
          } else {
            await sendMessage(chatId, `❌ Proxy tidak aktif atau informasi tidak dapat diakses. Cek kembali alamat proxy dan coba lagi.`);
          }
        } catch (error) {
          console.error('Error getting proxy information:', error);
          await sendMessage(chatId, `❌ Gagal mendapatkan informasi proxy. Coba lagi nanti.`);
        }

        return new Response("OK");
      }

      // Jika format tidak dikenali
      await sendMessage(chatId, `❌ Format tidak dikenali! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
      return new Response("OK");
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Fungsi untuk mendapatkan informasi proxy
async function getProxyInfo(proxy) {
  const apiUrl = `http://ip-api.com/json/${proxy}?fields=country,regionName,city,isp,query,status`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.status === 'fail') {
    return { status: 'fail' };
  }

  return {
    address: data.query,
    country: data.country,
    region: data.regionName,
    city: data.city,
    isp: data.isp,
    status: data.status === 'success' ? 'active' : 'inactive',
  };
}
