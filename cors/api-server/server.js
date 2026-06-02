const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const corsMode = parsedUrl.query.cors;

    if (corsMode === 'open') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (corsMode === 'restricted') {
        const allowedOrigin = 'http://localhost:8080';
        if (req.headers.origin === allowedOrigin) {
            res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
            res.setHeader('Vary', 'Origin');
        }
    } else if (corsMode === 'credentials') {
        const allowedOrigin = 'http://localhost:8080';
        if (req.headers.origin === allowedOrigin) {
            res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Vary', 'Origin');
        }
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Custom-Header');
        res.setHeader('Access-Control-Max-Age', '3600');
        res.writeHead(204);
        res.end();
        return;
    }

    if (parsedUrl.pathname === '/api/data') {
        const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        res.setHeader('X-Request-Id', requestId);

        if (parsedUrl.query.expose === 'true') {
            res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: "APIからのデータです",
            timestamp: Date.now(),
            method: req.method,
            headers: {
                origin: req.headers.origin,
                authorization: req.headers.authorization || null,
                "x-custom-header": req.headers["x-custom-header"] || null,
            },
        }));
        return;
    }

    if (parsedUrl.pathname === '/api/set-cookie') {
        res.setHeader('Set-Cookie', 'session=abc123; Path=/; HttpOnly; SameSite=None; Secure');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cookie set successfully' }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
})

server.listen(3000, () => {
    console.log("API server running on port 3000");
});