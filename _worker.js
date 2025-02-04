addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Endpoint untuk membuat akun VLESS
  if (url.pathname === '/create-vless') {
    return createVlessAccount()
  } else {
    return new Response('Not Found', { status: 404 })
  }
}

function createVlessAccount() {
  const uuid = generateUUID()
  const vlessConfig = `vless://${uuid}@your-domain.com:443?encryption=none&security=tls&sni=your-domain.com&type=ws&host=your-domain.com&path=/vless-path#VLESS-Account`

  return new Response(JSON.stringify({ vless: vlessConfig }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
