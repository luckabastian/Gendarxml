// Cloudflare API details
const CLOUDFLARE_API_KEY = 'your_cloudflare_api_key';
const CLOUDFLARE_EMAIL = 'your_email@example.com';
const CLOUDFLARE_ZONE_ID = 'x5e6l4Nej562Ikx7_qd8Zb7kHvsUAKfRAesdsgVL';

// HTML Form
const HTML_FORM = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Custom Domain</title>
</head>
<body>
    <h1>Daftar Custom Domain</h1>
    <form id="registrationForm">
        <label for="domain">Domain:</label>
        <input type="text" id="domain" name="domain" placeholder="example.com" required>
        <br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" placeholder="your@email.com" required>
        <br>
        <label for="worker">Worker:</label>
        <input type="text" id="worker" name="worker" placeholder="nama-worker" required>
        <br>
        <button type="submit">Daftar</button>
    </form>

    <script>
        document.getElementById('registrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const domain = document.getElementById('domain').value;
            const email = document.getElementById('email').value;
            const worker = document.getElementById('worker').value;

            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain, email, worker }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Berhasil! Custom domain telah dibuat.');
                window.location.href = \`https://\${domain}/sub\`;
            } else {
                alert(\`Gagal: \${result.error}\`);
            }
        });
    </script>
</body>
</html>
`;

// Fungsi untuk membuat DNS record di Cloudflare
async function createDNSRecord(domain) {
    const url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
    const headers = {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json',
    };
    const data = {
        type: 'A',
        name: domain,
        content: '192.0.2.1', // Ganti dengan IP tujuan
        ttl: 1,
        proxied: true,
    };
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    return response.ok;
}

// Fungsi untuk membuat worker route di Cloudflare
async function createWorkerRoute(domain, worker) {
    const url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/workers/routes`;
    const headers = {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json',
    };
    const data = {
        pattern: `${domain}/*`,
        script: worker,
    };
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    return response.ok;
}

// Handler untuk Worker
addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    // Tampilkan form di root path
    if (url.pathname === '/') {
        return new Response(HTML_FORM, {
            headers: { 'Content-Type': 'text/html' },
        });
    }

    // Handle POST request untuk pendaftaran
    if (url.pathname === '/register' && request.method === 'POST') {
        const data = await request.json();
        const { domain, email, worker } = data;

        if (!domain || !email || !worker) {
            return new Response(JSON.stringify({ error: 'Semua field harus diisi!' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Buat DNS record
        const dnsRecordSuccess = await createDNSRecord(domain);
        if (!dnsRecordSuccess) {
            return new Response(JSON.stringify({ error: 'Gagal membuat DNS record!' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Buat worker route
        const workerRouteSuccess = await createWorkerRoute(domain, worker);
        if (!workerRouteSuccess) {
            return new Response(JSON.stringify({ error: 'Gagal membuat worker route!' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Custom domain berhasil dibuat!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Handle 404 untuk path lainnya
    return new Response('Not Found', { status: 404 });
}
