import { connect } from "cloudflare:sockets";

const proxyListURL = 'https://raw.githubusercontent.com/h58fmb0344g9h3/p57gdv3j3n0vg334/refs/heads/main/f74bjd2h2ko99f3j5';
const namaWeb = 'BITZBLACK NETWORK'
const linkTele = 'https://t.me/bitzblackbot'

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
      const limit = parseInt(url.searchParams.get('limit"), 10);
      let configs;

      switch (url.pathname) {
        case '/sub/clash':
          configs = await generateClashSub(type, bugs, tls, country, limit);
          break;
        case '/sub/surfboard':
          configs = await generateSurfboardSub(type, bugs, tls, country, limit);
          break;
        case '/sub/singbox':
          configs = await generateSingboxSub(type, bugs, tls, country, limit);
          break;
        case '/sub/husi':
          configs = await generateHusiSub(type, bugs, tls, country, limit);
          break;
        case '/sub/nekobox':
          configs = await generateNekoboxSub(type, bugs, tls, country, limit);
          break;
        case '/sub/v2rayng':
          configs = await generateV2rayngSub(type, bugs, tls, country, limit);
          break;
        case '/sub/v2ray':
          configs = await generateV2raySub(type, bugs, tls, country, limit);
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

// Fungsi-fungsi lainnya tetap sama seperti sebelumnya, 
// hanya menghapus parameter wildcard dan logika terkait wildcard

async function generateClashSub(type, bug, tls, country = null, limit = null) {
  // Implementasi generateClashSub tanpa wildcard
  // ...
}

async function generateSurfboardSub(type, bug, tls, country = null, limit = null) {
  // Implementasi generateSurfboardSub tanpa wildcard
  // ...
}

// Fungsi generator config lainnya disesuaikan dengan menghapus parameter wildcard

async function handleWebRequest(request) {
  // Modifikasi handleWebRequest dengan menghapus logika wildcard
  // ...
  
  const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim();
  let ispName = sanitize(`${emojiFlag} (${line.split(',')[2]}) ${line.split(',')[3]} ${count ++}`);
  
  // Menghapus wildcard dari config
  const modifiedHostName = hostName;
  
  // Menghapus pilihan wildcard dari UI
  // ...
}

// Fungsi-fungsi lainnya tetap sama kecuali bagian yang berhubungan dengan wildcard
