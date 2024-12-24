const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = '7961283450:AAGvj_tjUn4kGwQzruOepP-3S32uTqpoKto';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === `/webhook`) {
    const json = await request.json()
    const message = json.message
    if (message && message.text) {
      const userId = message.from.id
      const text = message.text.trim()

      // Perintah /start untuk sambutan pertama
      if (text === "/start") {
        const welcomeMessage = `
Selamat datang di Bot Akun VLESS dan Trojan!

Gunakan perintah berikut untuk membuat akun:

**/createakun <IP> <Port>**

Contoh: 
/createakun 192.168.1.1 725

Bot ini akan membuatkan akun VLESS dan Trojan untuk Anda dengan IP dan port yang Anda berikan.

Silakan masukkan perintah untuk memulai!
`
        await sendTelegramMessage(userId, welcomeMessage)
        return new Response('OK', { status: 200 })
      }

      // Memeriksa apakah perintah yang dikirimkan sesuai dengan format /createakun
      if (text.startsWith("/createakun")) {
        const args = text.split(" ")
        if (args.length !== 3) {
          return new Response("Format salah! Gunakan: /createakun <IP> <Port>", {
            status: 400
          })
        }

        const ip = args[1]
        const port = args[2]

        const vlessAccount = generateVlessAccount(ip, port)
        const trojanAccount = generateTrojanAccount(ip, port)

        const responseMessage = `
**Akun VLESS**:
\`\`\`
${vlessAccount}
\`\`\`
**Akun Trojan**:
\`\`\`
${trojanAccount}
\`\`\`
`

        // Kirim hasil ke Telegram user
        await sendTelegramMessage(userId, responseMessage)
        return new Response("Akun berhasil dibuat dan dikirim melalui Telegram", { status: 200 })
      }
    }

    return new Response('OK', { status: 200 })
  }

  return new Response('Not Found', { status: 404 })
}

// Fungsi untuk menghasilkan akun VLESS
function generateVlessAccount(ip, port) {
  return `vless://${passuid}@${servervless}:443?security=tls&encryption=none&type=ws&host=${servervless}&path=%2F${ip}%3D${port}&sni=${servervless}&fp=randomized#VLESS_${ip}`;
}

// Fungsi untuk menghasilkan akun Trojan
function generateTrojanAccount(ip, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2F${ip}%3D${port}&sni=${servertrojan}#Trojan_${ip}`;
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendTelegramMessage(userId, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const payload = {
    chat_id: userId,
    text: message,
    parse_mode: "Markdown",
  }

  const init = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  await fetch(url, init)
}
