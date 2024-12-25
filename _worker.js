// Fungsi untuk mendapatkan informasi terkait proxy
async function getProxyInfo(proxy) {
  // Menggunakan API ip-api untuk mendapatkan informasi negara dari alamat IP
  const response = await fetch(`http://ip-api.com/json/${proxy}?fields=country,regionName,city,lat,lon,isp,org`);
  
  if (!response.ok) {
    throw new Error('Tidak dapat mengakses API ip-api');
  }

  const data = await response.json();

  // Menentukan nama proxy dan bendera berdasarkan negara
  const country = data.country || 'Unknown Country';
  const region = data.regionName || 'Unknown Region';
  const city = data.city || 'Unknown City';

  const proxyInfo = {
    alamat: proxy,
    nama: `${country} Proxy`, // Menyesuaikan nama proxy dengan negara
    bendera: getFlagEmoji(country),  // Menentukan bendera berdasarkan negara
    status: 'Aktif',  // Status proxy, bisa disesuaikan lebih lanjut
  };

  return proxyInfo;
}

// Fungsi untuk mendapatkan emoji bendera berdasarkan negara
function getFlagEmoji(country) {
  const countryCodes = {
    'Indonesia': '🇮🇩',
    'United States': '🇺🇸',
    'Germany': '🇩🇪',
    'United Kingdom': '🇬🇧',
    // Tambahkan lebih banyak negara sesuai kebutuhan
  };
  
  // Mengembalikan bendera sesuai negara atau default bendera 'Unknown'
  return countryCodes[country] || '🏳️‍🌈';
}

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

Contoh format yang benar:
192.168.1.1:443

Ingin mencari proxy aktif? Klik tautan di bawah ini:
[Daftar Proxy Aktif](https://github.com/Gendarxml/Cek-domain/blob/main/genarate-url.js)

Dan untuk URL bug operator aktif, klik di sini:
[Daftar Bug Operator Aktif](https://github.com/Gendarxml/BAHAN/blob/main/List%20Paket)

Silakan kirim proxy dan port Anda sekarang!
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

        // Ambil informasi proxy
        const proxyInfo = await getProxyInfo(proxy);

        // Generate akun Trojan dan VLESS dengan nama ID Telegram
        const vlessLink = generateVlessLink(proxy, port);
        const trojanLink = generateTrojanLink(proxy, port);

        const responseMessage = `
✅ Berikut akun Anda:

🔹 **Alamat Proxy**: ${proxyInfo.alamat}
🔹 **Nama Proxy**: ${proxyInfo.nama}
🔹 **Bendera**: ${proxyInfo.bendera}
🔹 **Status**: ${proxyInfo.status}

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
