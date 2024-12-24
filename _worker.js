<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Active Proxy Search</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            margin: 20px;
        }
        .btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background-color: #45a049;
        }
        .proxies-list {
            margin-top: 20px;
            display: none;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Search for Active Proxies</h1>
        <button class="btn" onclick="showProxies()">Click here to find active proxies</button>
        <div class="proxies-list" id="proxies-list">
            <h2>Proxies:</h2>
            <pre id="proxy-list-text">Loading...</pre>
        </div>
    </div>

    <script>
        function showProxies() {
            // List of proxy servers
            const proxies = {
                "SG": [
                    "101.32.247.126:725",
                    "103.180.161.10:587",
                    "103.180.161.69:587",
                    "103.180.161.123:587",
                    "103.3.63.253:46683",
                    "104.248.145.216:443",
                    "104.248.146.212:2053",
                    "104.248.146.212:8443",
                    "104.248.154.142:8443",
                    "104.248.154.142:2053"
                ],
                "HK": [
                    "101.32.10.244:10457",
                    "101.32.40.116:8888",
                    "103.103.245.51:16118",
                    "103.127.248.51:443",
                    "103.133.178.229:26010",
                    "103.149.91.215:5888",
                    "103.172.41.223:443",
                    "103.175.14.144:443",
                    "103.195.49.224:1009",
                    "103.195.49.225:1009"
                ],
                // Add more countries/proxies here...
            };

            // Format the proxy list into a string
            let proxyText = "";
            for (let country in proxies) {
                proxyText += `"${country}": [\n`;
                proxies[country].forEach(proxy => {
                    proxyText += `    "${proxy}",\n`;
                });
                proxyText += "  ],\n";
            }

            // Display the formatted proxies
            document.getElementById("proxy-list-text").textContent = proxyText;

            // Show the proxy list container
            document.getElementById("proxies-list").style.display = "block";
        }
    </script>
</body>
</html>
