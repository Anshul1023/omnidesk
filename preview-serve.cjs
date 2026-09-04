const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist');
const mimes = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server = http.createServer((req, res) => {
  let fp = path.join(dist, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html');
  const ext = path.extname(fp);
  res.writeHead(200, {'Content-Type': mimes[ext]||'application/octet-stream'});
  fs.createReadStream(fp).pipe(res);
});
server.listen(5173, '0.0.0.0', () => console.log('Listening on http://localhost:5173'));
