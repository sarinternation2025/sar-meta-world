const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Test Server</title></head>
      <body>
        <h1>Node.js Test Server Working</h1>
        <p>Time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

const port = 3333;
server.listen(port, '127.0.0.1', () => {
  console.log(`Test server running on http://127.0.0.1:${port}`);
});
