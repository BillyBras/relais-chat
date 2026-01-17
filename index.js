const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    secure: false
});

const PC_URL = 'Forwarding HTTP traffic from https://dc8eb5128c0554f2-128-79-64-107.serveousercontent.com';

const server = http.createServer((req, res) => {
    req.headers['skip-browser-warning'] = 'true';

    proxy.web(req, res, { 
        target: PC_URL, 
        changeOrigin: true,
        ws: true,
        headers: { 'skip-browser-warning': 'true' }
    }, (e) => {
        console.error("Erreur Proxy:", e.message);
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('🛠️ Relais actif mais le PC ne répond pas. Vérifie ton terminal SSH.');
    });
});

server.on('upgrade', (req, socket, head) => {
    req.headers['skip-browser-warning'] = 'true';
    proxy.ws(req, socket, head, {
        target: PC_URL,
        changeOrigin: true,
        headers: { 'skip-browser-warning': 'true' }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Relais démarré sur le port ${PORT}`));
