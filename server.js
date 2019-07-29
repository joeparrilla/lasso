const fs = require('fs');
const http = require('http');

const html = fs.readFileSync('index.html');
const js = fs.readFileSync('js/game.js');

const server = http.createServer((request, response) => {

    if (request.url === '/') {
        response.writeHead(200, { 'content-type': 'text/html' });
        response.end(html);
    }

    if (request.url === '/game') {
        response.writeHead(200, { 'content-type': 'application/javascript' });
        response.end(js);
    }
});

server.listen(7000);