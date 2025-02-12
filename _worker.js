from flask import Flask, request, jsonify, render_template_string
import requests

app = Flask(__name__)

# Cloudflare API details
CLOUDFLARE_API_KEY = 'your_cloudflare_api_key'
CLOUDFLARE_EMAIL = 'your_email@example.com'
CLOUDFLARE_ZONE_ID = 'your_zone_id'

# HTML Form
HTML_FORM = '''
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
                window.location.href = `https://${domain}/sub`;
            } else {
                alert(`Gagal: ${result.error}`);
            }
        });
    </script>
</body>
</html>
'''

# Route untuk menampilkan form
@app.route('/')
def index():
    return render_template_string(HTML_FORM)

# Endpoint untuk pendaftaran
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    domain = data.get('domain')
    email = data.get('email')
    worker = data.get('worker')

    if not domain or not email or not worker:
        return jsonify({'error': 'Semua field harus diisi!'}), 400

    # Buat DNS record untuk domain
    dns_record = create_dns_record(domain)
    if not dns_record:
        return jsonify({'error': 'Gagal membuat DNS record!'}), 500

    # Buat worker route
    worker_route = create_worker_route(domain, worker)
    if not worker_route:
        return jsonify({'error': 'Gagal membuat worker route!'}), 500

    return jsonify({'message': 'Custom domain berhasil dibuat!'}), 200

# Fungsi untuk membuat DNS record
def create_dns_record(domain):
    url = f'https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/dns_records'
    headers = {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json',
    }
    data = {
        'type': 'A',
        'name': domain,
        'content': '192.0.2.1',  # Ganti dengan IP tujuan
        'ttl': 1,
        'proxied': True,
    }
    response = requests.post(url, headers=headers, json=data)
    return response.status_code == 200

# Fungsi untuk membuat worker route
def create_worker_route(domain, worker):
    url = f'https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/workers/routes'
    headers = {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json',
    }
    data = {
        'pattern': f'{domain}/*',
        'script': worker,
    }
    response = requests.post(url, headers=headers, json=data)
    return response.status_code == 200

if __name__ == '__main__':
    app.run(debug=True)
