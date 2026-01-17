const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
// Ton adresse Localtonet active
const PC_URL = 'https://cedwospxv.localto.net'; 

const server = http.createServer((req, res) => {
    proxy.web(req, res, { target: PC_URL, changeOrigin: true }, (e) => {
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1 style="text-align:center; font-family:sans-serif; margin-top:50px;">🛠️ Serveur en maintenance</h1>');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Relais actif sur le port ${PORT}`));
