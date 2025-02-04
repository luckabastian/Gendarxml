import { connect } from "cloudflare:sockets";

const proxyListURL = 'https://raw.githubusercontent.com/h58fmb0344g9h3/p57gdv3j3n0vg334/refs/heads/main/f74bjd2h2ko99f3j5';
const namaWeb = 'BITZBLACK NETWORK';
const linkTele = 'https://t.me/bitzblackbot';

// Global Variables
let cachedProxyList = [];
let proxyIP = "";

// Constants
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;

async function getProxyList(forceReload = false) {
  if (!cachedProxyList.length || forceReload) {
    if (!proxyListURL) {
      throw new Error("No Proxy List URL Provided!");
    }

    const proxyBank = await fetch(proxyListURL);
    if (proxyBank.status === 200) {
      const proxyString = ((await proxyBank.text()) || "").split("\n").filter(Boolean);
      cachedProxyList = proxyString
        .map((entry) => {
          const [proxyIP, proxyPort, country, org] = entry.split(",");
          return {
            proxyIP: proxyIP || "Unknown",
            proxyPort: proxyPort || "Unknown",
            country: country.toUpperCase() || "Unknown",
            org: org || "Unknown Org",
          };
        })
        .filter(Boolean);
    }
  }

  return cachedProxyList;
}

async function reverseProxy(request, target) {
  const targetUrl = new URL(request.url);
  targetUrl.hostname = target;

  const modifiedRequest = new Request(targetUrl, request);
  modifiedRequest.headers.set("X-Forwarded-Host", request.headers.get("Host"));

  const response = await fetch(modifiedRequest);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("X-Proxied-By", "Cloudflare Worker");

  return newResponse;
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");

      // Map untuk menyimpan proxy per country code
      const proxyState = new Map();

      // Fungsi untuk memperbarui proxy setiap menit
      async function updateProxies() {
        const proxies = await getProxyList(env);
        const groupedProxies = groupBy(proxies, "country");

        for (const [countryCode, proxies] of Object.entries(groupedProxies)) {
          const randomIndex = Math.floor(Math.random() * proxies.length);
          proxyState.set(countryCode, proxies[randomIndex]);
        }

        console.log("Proxy list updated:", Array.from(proxyState.entries()));
      }

      // Jalankan pembaruan proxy setiap menit
      ctx.waitUntil(
        (async function periodicUpdate() {
          await updateProxies();
          setInterval(updateProxies, 60000); // Setiap 60 detik
        })()
      );

      if (upgradeHeader === "websocket") {
        // Match path dengan format /CC atau /CCangka
        const pathMatch = url.pathname.match(/^\/([A-Z]{2})(\d+)?$/);

        if (pathMatch) {
          const countryCode = pathMatch[1];
          const index = pathMatch[2] ? parseInt(pathMatch[2], 10) - 1 : null;

          console.log(`Country Code: ${countryCode}, Index: ${index}`);

          // Ambil proxy berdasarkan country code
          const proxies = await getProxyList(env);
          const filteredProxies = proxies.filter((proxy) => proxy.country === countryCode);

          if (filteredProxies.length === 0) {
            return new Response(`No proxies available for country: ${countryCode}`, { status: 404 });
          }

          let selectedProxy;

          if (index === null) {
            // Ambil proxy acak dari state jika ada
            selectedProxy = proxyState.get(countryCode) || filteredProxies[0];
          } else if (index < 0 || index >= filteredProxies.length) {
            return new Response(
              `Index ${index + 1} out of bounds. Only ${filteredProxies.length} proxies available for ${countryCode}.`,
              { status: 400 }
            );
          } else {
            selectedProxy = filteredProxies[index];
          }

          proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
          console.log(`Selected Proxy: ${proxyIP}`);
          return await websockerHandler(request);
        }

        // Match path dengan format ip:port atau ip=port
        const ipPortMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);

        if (ipPortMatch) {
          proxyIP = ipPortMatch[1].replace(/[=:-]/, ":"); // Standarisasi menjadi ip:port
          console.log(`Direct Proxy IP: ${proxyIP}`);
          return await websockerHandler(request, proxyIP);
        }
      }
      
      const bexx = url.hostname;
      const type = url.searchParams.get('type') || 'mix';
      const tls = url.searchParams.get('tls') !== 'false';
      const bugs = url.searchParams.get('bug') || bexx;
      const country = url.searchParams.get('country');
      const limit = parseInt(url.searchParams.get('limit'), 10); // Ambil nilai limit
      let configs;

      switch (url.pathname) {
        case '/sub/clash':
          configs = await generateClashSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/surfboard':
          configs = await generateSurfboardSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/singbox':
          configs = await generateSingboxSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/husi':
          configs = await generateHusiSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/nekobox':
          configs = await generateNekoboxSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/v2rayng':
          configs = await generateV2rayngSub(type, bugs, bexx, tls, country, limit);
          break;
        case '/sub/v2ray':
          configs = await generateV2raySub(type, bugs, bexx, tls, country, limit);
          break;
        case "/web":
          return await handleWebRequest(request);
          break;
        case "/sub":
          return new Response(await handleSubRequest(url.hostname), { headers: { 'Content-Type': 'text/html' } })
          break;
        default:
          const targetReverseProxy = "example.com";
          return await reverseProxy(request, targetReverseProxy);
      }

      return new Response(configs);
    } catch (err) {
      return new Response(`An error occurred: ${err.toString()}`, {
        status: 500,
      });
    }
  },
};

// Helper function: Group proxies by country
function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

async function handleSubRequest(hostnem) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sub Link Generator</title>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <style>
        :root {
            --color-primary: #00ff88;
            --color-secondary: #00ffff;
            --color-background: #0a0f1a;
            --color-card: rgba(15, 22, 36, 0.95);
            --color-text: #e0f4f4;
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            outline: none;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--color-background);
            color: var(--color-text);
            line-height: 1.6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            width: 100%;
            max-width: 500px;
            padding: 2rem;
        }

        .card {
            background: var(--color-card);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 136, 0.2);
            transition: var(--transition);
        }

        .title {
            text-align: center;
            color: var(--color-primary);
            margin-bottom: 1.5rem;
            font-size: 2rem;
            font-weight: 700;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--color-text);
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 255, 136, 0.05);
            border: 2px solid rgba(0, 255, 136, 0.3);
            border-radius: 8px;
            color: var(--color-text);
            transition: var(--transition);
        }

        .form-control:focus {
            border-color: var(--color-secondary);
            box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.2);
        }

        .btn {
            width: 100%;
            padding: 0.75rem;
            background: var(--color-primary);
            color: var(--color-background);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }

        .btn:hover {
            background: var(--color-secondary);
        }

        .result {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 8px;
            word-break: break-all;
        }

        .loading {
            display: none;
            text-align: center;
            color: var(--color-primary);
            margin-top: 1rem;
        }

        .copy-btns {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
        }

        .copy-btn {
            background: rgba(0, 255, 136, 0.2);
            color: var(--color-primary);
            padding: 0.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: var(--transition);
        }

        .copy-btn:hover {
            background: rgba(0, 255, 136, 0.3);
        }

        #error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">Sub Link Generator</h1>
            <form id="subLinkForm">
                <div class="form-group">
                    <label for="app">Aplikasi</label>
                    <select id="app" class="form-control" required>
                        <option value="v2ray">V2RAY</option>
                        <option value="v2rayng">V2RAYNG</option>
                        <option value="clash">CLASH</option>
                        <option value="nekobox">NEKOBOX</option>
                        <option value="singbox">SINGBOX</option>
                        <option value="surfboard">SURFBOARD</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="bug">Bug</label>
                    <input type="text" id="bug" class="form-control" placeholder="Contoh: quiz.int.vidio.com" required>
                </div>

                <div class="form-group">
                    <label for="configType">Tipe Config</label>
                    <select id="configType" class="form-control" required>
                        <option value="vless">VLESS</option>
                        <option value="trojan">TROJAN</option>
                        <option value="shadowsocks">SHADOWSOCKS</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tls">TLS</label>
                    <select id="tls" class="form-control">
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="country">Negara</label>
                    <select id="country" class="form-control">
                        <option value="all">ALL COUNTRY</option>
                        <option value="random">RANDOM</option>
                        <option value="id">INDONESIA</option>
                        <option value="sg">SINGAPURA</option>
                        <option value="my">MALAYSIA</option>
                        <option value="jp">JEPANG</option>
                        <option value="kr">KOREA</option>
                        <option value="us">UNITED STATES</option>
                        <option value="gb">UNITED KINGDOM</option>
                        <option value="hk">HONGKONG</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="limit">Jumlah Config</label>
                    <input type="number" id="limit" class="form-control" min="1" max="20" placeholder="Maks 20" required>
                </div>

                <button type="submit" class="btn">Generate Sub Link</button>
            </form>

            <div id="loading" class="loading">Generating Link...</div>
            <div id="error-message"></div>

            <div id="result" class="result" style="display: none;">
                <p id="generated-link"></p>
                <div class="copy-btns">
                    <button id="copyLink" class="copy-btn">Copy Link</button>
                    <button id="openLink" class="copy-btn">Buka Link</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Performance optimization: Use event delegation and minimize DOM queries
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('subLinkForm');
            const loadingEl = document.getElementById('loading');
            const resultEl = document.getElementById('result');
            const generatedLinkEl = document.getElementById('generated-link');
            const copyLinkBtn = document.getElementById('copyLink');
            const openLinkBtn = document.getElementById('openLink');
            const errorMessageEl = document.getElementById('error-message');
            const appSelect = document.getElementById('app');
            const configTypeSelect = document.getElementById('configType');

            // Cached selectors to minimize DOM lookups
            const elements = {
                app: document.getElementById('app'),
                bug: document.getElementById('bug'),
                configType: document.getElementById('configType'),
                tls: document.getElementById('tls'),
                country: document.getElementById('country'),
                limit: document.getElementById('limit')
            };

            // App and config type interaction
            appSelect.addEventListener('change', () => {
                const selectedApp = appSelect.value;
                const shadowsocksOption = configTypeSelect.querySelector('option[value="shadowsocks"]');
                
                if (selectedApp === 'surfboard') {
                    configTypeSelect.value = 'trojan';
                    configTypeSelect.querySelector('option[value="trojan"]').selected = true;
                    shadowsocksOption.disabled = true;
                } else {
                    shadowsocksOption.disabled = false;
                }
            });

            // Form submission handler
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Reset previous states
                loadingEl.style.display = 'block';
                resultEl.style.display = 'none';
                errorMessageEl.textContent = '';

                try {
                    // Validate inputs
                    const requiredFields = ['bug', 'limit'];
                    for (let field of requiredFields) {
                        if (!elements[field].value.trim()) {
                            throw new Error(\`Harap isi \${field === 'bug' ? 'Bug' : 'Jumlah Config'}\`);
                        }
                    }

                    // Construct query parameters
                    const params = new URLSearchParams({
                        type: elements
