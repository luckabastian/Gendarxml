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
    const proxyBank = await fetch(proxyListURL);
    if (proxyBank.status === 200) {
      const proxyString = (await proxyBank.text()).split("\n").filter(Boolean);
      cachedProxyList = proxyString.map((entry) => {
        const [proxyIP, proxyPort, country, org] = entry.split(",");
        return {
          proxyIP: proxyIP || "Unknown",
          proxyPort: proxyPort || "Unknown",
          country: (country || "Unknown").toUpperCase(),
          org: org || "Unknown Org",
        };
      });
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
  return new Response(response.body, response);
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");

      // Proxy state management
      const proxyState = new Map();
      
      async function updateProxies() {
        const proxies = await getProxyList();
        const groupedProxies = proxies.reduce((acc, proxy) => {
          acc[proxy.country] = acc[proxy.country] || [];
          acc[proxy.country].push(proxy);
          return acc;
        }, {});
        
        for (const [country, proxies] of Object.entries(groupedProxies)) {
          proxyState.set(country, proxies[Math.floor(Math.random() * proxies.length)]);
        }
      }

      ctx.waitUntil((async () => {
        await updateProxies();
        setInterval(updateProxies, 60000);
      })());

      if (upgradeHeader === "websocket") {
        const pathMatch = url.pathname.match(/^\/([A-Z]{2})(\d+)?$/);
        if (pathMatch) {
          const [, countryCode, index] = pathMatch;
          const proxies = await getProxyList();
          const filteredProxies = proxies.filter(p => p.country === countryCode);
          
          if (!filteredProxies.length) {
            return new Response(`No proxies for ${countryCode}`, { status: 404 });
          }

          const selectedProxy = index ? 
            filteredProxies[parseInt(index) - 1] : 
            proxyState.get(countryCode) || filteredProxies[0];
          
          proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
          return handleWebSocket(request);
        }

        const ipPortMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);
        if (ipPortMatch) {
          proxyIP = ipPortMatch[1].replace(/[=:-]/, ":");
          return handleWebSocket(request);
        }
      }

      const bexx = url.hostname;
      const type = url.searchParams.get('type') || 'mix';
      const tls = url.searchParams.get('tls') !== 'false';
      const bugs = url.searchParams.get('bug') || bexx;
      const country = url.searchParams.get('country');
      const limit = parseInt(url.searchParams.get('limit') || "20", 10);

      let configs;
      switch(url.pathname) {
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
          return handleWebRequest(request);
        case "/sub":
          return new Response(await handleSubRequest(url.hostname), 
            { headers: { 'Content-Type': 'text/html' } });
        default:
          return reverseProxy(request, "example.com");
      }
      
      return new Response(configs);
    } catch (err) {
      return new Response(err.stack, { status: 500 });
    }
  }
};

// WebSocket Handler
async function handleWebSocket(request) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  const remoteSocket = connect(proxyIP.split(":")[0], parseInt(proxyIP.split(":")[1]));
  
  const readableWebSocketStream = new ReadableStream({
    start(controller) {
      server.addEventListener("message", (event) => controller.enqueue(event.data));
      server.addEventListener("close", () => controller.close());
      server.addEventListener("error", (err) => controller.error(err));
    }
  });

  readableWebSocketStream.pipeTo(remoteSocket.writable).catch(() => {});
  remoteSocket.readable.pipeTo(new WritableStream({
    write(chunk) {
      server.send(chunk);
    },
    close() {
      server.close();
    },
    abort(err) {
      server.close(1011, err.message);
    }
  }));

  return new Response(null, { status: 101, webSocket: client });
}

// Helper functions
function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Configuration generators (contoh satu generator)
async function generateClashSub(type, bug, tls, country, limit = 20) {
  const proxies = await getProxyList();
  let config = proxies.slice(0, limit).map((p, i) => {
    const uuid = generateUUIDv4();
    return `- name: ${p.country} ${i+1}
  type: ${type}
  server: ${bug}
  port: ${tls ? 443 : 80}
  uuid: ${uuid}
  tls: ${tls}
  ${type === 'trojan' ? `password: ${uuid}` : ''}`;
  }).join("\n");
  
  return `proxies:\n${config}`;
}

// ... (Tambahkan generator config lainnya dengan pola serupa)

// Handler untuk halaman web
async function handleWebRequest(request) {
  // ... (Implementasi sederhana untuk halaman web)
  return new Response("Web Interface", { headers: { "Content-Type": "text/html" } });
}

async function handleSubRequest() {
  // ... (Implementasi form generator)
  return "<html>...</html>";
}
