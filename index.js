const fs = require('fs');
const axios = require('axios').default;
const express = require('express');

const app = express();
const http = require('http');
const server = http.createServer(app);

const tokens = [
  'MTI1NzYxNDk1Mjk2MTY3MTE3MA.Ght6CY.JWr4ukpqbM6jJZNO9TSZfkHbj9z921BesCU6nA'
];

const payload = {
  'content': 'كسمك يبنزبي'
};
const groupIds = [
  "1251265204642386013"
];

let currentTokenIndex = 0;
let currentGroupIndex = 0;

let cachedData = {};
if (fs.existsSync('cachedData.json')) {
  const data = fs.readFileSync('cachedData.json');
  cachedData = JSON.parse(data);
}

function saveCachedData() {
  fs.writeFileSync('cachedData.json', JSON.stringify(cachedData));
}

function sendRequest() {
  const currentToken = tokens[currentTokenIndex];
  const currentGroupId = groupIds[currentGroupIndex];

  const header = {
    'Authorization': currentToken
  };

  if (cachedData[currentTokenIndex] && cachedData[currentTokenIndex][currentGroupId]) {
    const lastRequestTime = cachedData[currentTokenIndex][currentGroupId];
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastRequestTime;

    if (timeDiff < 3000) {
      const retryInterval = 3000 - timeDiff;
      setTimeout(sendRequest, retryInterval);
      return;
    }
  }

  axios.post(`https://discord.com/api/v10/channels/${currentGroupId}/messages`, payload, {
    headers: header
  })
  .then(response => {
    console.log(response.data);

    const intervalBetweenGroups = 3000; 

    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
    currentGroupIndex = (currentGroupIndex + 1) % groupIds.length;

    if (!cachedData[currentTokenIndex]) {
      cachedData[currentTokenIndex] = {};
    }
    cachedData[currentTokenIndex][currentGroupId] = new Date().getTime();
    saveCachedData();

    setTimeout(sendRequest, intervalBetweenGroups);
  })
  .catch(error => {
    if (error.response && error.response.status === 429) {
      
      console.error(`Rate limited. Retrying after exponential backoff.`);
      const retryAfter = error.response.headers['retry-after'] || 10; 
      setTimeout(sendRequest, retryAfter * 1000);
    } else {
      console.error(`Error: ${error.message}`);
      const retryInterval = 1000; 
      setTimeout(sendRequest, retryInterval);
    }
  });
}

sendRequest();

app.get('/', (req, res) => {
  res.send(`<body><center><h1>كسمك يا علاوي</h1></center></body>`);
});

app.get('/webview', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>ام علاوي</title>
      </head>
      <body style="margin: 0; padding: 0;">
        <iframe width="100%" height="100%" src="https://axocoder.vercel.app/" frameborder="0" allowfullscreen></iframe>
      </body>
    </html>
  `);
});

server.listen(8080, () => {
  console.log("im ready to nik ksm 3lawi!!");
});
