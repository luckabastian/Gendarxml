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
      const tls = url.search
