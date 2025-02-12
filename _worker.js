<DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Worker Setup</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }
    input[type="text"] {
      width: 100%;
      padding: 8px;
      margin-bottom: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Cloudflare Worker Setup</h2>
    <form id="setupForm">
      <label for="email">Email:</label>
      <input type="text" id="email" name="email" placeholder="Enter your Cloudflare email" required>

      <label for="apiKey">Global API Key:</label>
      <input type="text" id="apiKey" name="apiKey" placeholder="Enter your Global API Key" required>

      <button type="submit">Submit</button>
    </form>
  </div>

  <script>
    document.getElementById('setupForm').addEventListener('submit', function (event) {
      event.preventDefault(); // Mencegah form submit default

      // Ambil nilai dari input
      const email = document.getElementById('email').value;
      const apiKey = document.getElementById('apiKey').value;

      // Validasi input
      if (!email || !apiKey) {
        alert('Email and Global API Key are required!');
        return;
      }

      // Kirim data ke Worker
      fetch('https://your-worker-name.your-account.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, apiKey }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          alert('Setup successful!');
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Setup failed. Please try again.');
        });
    });
  </script>
</body>
</html>
