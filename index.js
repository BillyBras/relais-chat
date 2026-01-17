const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const PC_URL = 'https://cedwospxv.localto.net';

const server = http.createServer((req, res) => {
    req.headers['localtonet-skip-warning'] = 'true';

    proxy.web(req, res, { 
        target: PC_URL, 
        changeOrigin: true,
        headers: { 'localtonet-skip-warning': 'true' }
    }, (e) => {
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1 style="text-align:center;">🛠️ Serveur en maintenance</h1>');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Relais bypass actif sur le port ${PORT}`));
