const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    secure: false,
    changeOrigin: true
});

const PC_URL = 'Forwarding HTTP traffic from https://dc8eb5128c0554f2-128-79-64-107.serveousercontent.com'.trim();

const server = http.createServer((req, res) => {
    req.headers['skip-browser-warning'] = 'true';

    proxy.web(req, res, { 
        target: PC_URL,
        headers: { 'skip-browser-warning': 'true' }
    }, (e) => {
        console.error("Erreur de transmission vers le PC:", e.message);
        res.writeHead(503);
        res.end("Le relais est vivant, mais le tunnel Serveo ne repond pas.");
    });
});

server.on('upgrade', (req, socket, head) => {
    req.headers['skip-browser-warning'] = 'true';
    proxy.ws(req, socket, head, {
        target: PC_URL,
        headers: { 'skip-browser-warning': 'true' }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Relais en ligne sur le port ${PORT}`);
});
