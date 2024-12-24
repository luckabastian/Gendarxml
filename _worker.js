const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const serverwildcard = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = '7961283450:AAGvj_tjUn4kGwQzruOepP-3S32uTqpoKto';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Jika URL adalah webhook untuk Telegram
  if (url.pathname === `/webhook`) {
    const json = await request.json()
    
    // Mendapatkan pesan dari update
    const message = json.message
    if (message && message.text) {
      const userId = message.from.id
      const text = message.text.trim()

      // Memeriksa apakah perintah yang dikirimkan sesuai dengan format /createakun
      if (text.startsWith("/createakun")) {
        const args = text.split(" ")
        if (args.length !== 4) {
          return new Response("Format salah! Gunakan: /createakun <IP> <Port> <Path>", {
            status: 400
          })
        }

        const ip = args[1]
        const port = args[2]
        const path = args[3]

        const vlessAccount = generateVlessAccount(ip, port, path)
        const trojanAccount = generateTrojanAccount(ip, port, path)

        // Mengambil ping
        const pingVless = await getPing(servervless)
        const pingTrojan = await getPing(servertrojan)

        const responseMessage = `
**Akun VLESS**:
\`\`\`
${JSON.stringify(vlessAccount, null, 2)}
\`\`\`
**Akun Trojan**:
\`\`\`
${JSON.stringify(trojanAccount, null, 2)}
\`\`\`

**Informasi IP dan Port**:
- IP: ${ip}
- Port: ${port}
- Flag: VLESS / Trojan

**Ping**:
- Ping ke VLESS server: ${pingVless} ms
- Ping ke Trojan server: ${pingTrojan} ms
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
function generateVlessAccount(ip, port, path) {
  return {
    "v": "2",
    "ps": `Akun VLESS ${ip}:${port}`,
    "add": ip,
    "port": port,
    "id": generateUUID(),
    "aid": 64,
    "net": "ws",
    "type": "none",
    "host": servervless,
    "path": path,
    "tls": "tls"
  }
}

// Fungsi untuk menghasilkan akun Trojan
function generateTrojanAccount(ip, port, path) {
  return {
    "v": "2",
    "ps": `Akun Trojan ${ip}:${port}`,
    "add": ip,
    "port": port,
    "id": generateUUID(),
    "aid": 64,
    "net": "tcp",
    "type": "none",
    "host": servertrojan,
    "path": path,
    "tls": "tls"
  }
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

// Fungsi untuk menghasilkan UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Fungsi untuk mengukur ping ke server tertentu
async function getPing(server) {
  const startTime = Date.now()
  
  try {
    // Mengirimkan permintaan HTTP untuk mengukur latensi
    const response = await fetch(`https://${server}/ping`, { method: 'HEAD' })
    const endTime = Date.now()
    
    if (response.ok) {
      const latency = endTime - startTime
      return latency
    } else {
      return 'Ping failed'
    }
  } catch (error) {
    return 'Ping failed'
  }
}
