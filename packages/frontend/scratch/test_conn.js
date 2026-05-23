const http = require('http');

function testEndpoint(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (e) => {
      resolve({ error: e.message });
    });

    req.end();
  });
}

async function run() {
  console.log("=== Testing FastAPI Health Endpoints ===");
  
  const health1 = await testEndpoint('http://127.0.0.1:8000/health');
  console.log("Health (127.0.0.1):", health1.statusCode || "FAILED", health1.body || "", health1.error || "");

  const health2 = await testEndpoint('http://localhost:8000/health');
  console.log("Health (localhost):", health2.statusCode || "FAILED", health2.body || "", health2.error || "");
}

run();
