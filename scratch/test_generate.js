const http = require('http');

const data = JSON.stringify({
  concept: "B+ Tree Indexing"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/video/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log("Sending POST request to backend /api/video/generate...");
const req = http.request(options, (res) => {
  let body = '';
  console.log("Status Code:", res.statusCode);
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log("Response Body (Truncated):", body.slice(0, 1000));
    if (body.length > 1000) {
      console.log("... and more data");
    }
  });
});

req.on('error', (error) => {
  console.error("Error occurred:", error);
});

req.write(data);
req.end();
