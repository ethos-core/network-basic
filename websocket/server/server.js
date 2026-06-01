const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { time } = require('console');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join('/client', 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }
    if (req.url === '/status') {
        const statusData = {
            totalConnections: clients.size,
            clients: Array.from(wss.clients).map((ws) => ({
                connectedAt: new Date(ws.connectedAt).toISOString(),
                connectedFor: `${Math.floor((Date.now() - ws.connectedAt) / 1000)}s`,
                lastMessageAt: ws.lastMessageAt
                    ? new Date(ws.lastMessageAt).toISOString()
                    : null,
            })),
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(statusData, null, 2));
        return;
    }
    res.writeHead(404);
    res.end('404 Not Found');
});

const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws, req) => {
    ws.connectedAt = Date.now();
    ws.lastMessageAt = Date.now();
    ws.isAlive = true;
    clients.add(ws);
    const clientIp = req.socket.remoteAddress;
    console.log(`Client connected from ${clientIp}. Total: ${clients.size}`);

    ws.send(JSON.stringify({
        type: "system",
        message: `接続しました（現在 ${clients.size} 人が接続中）`,
        timestamp: Date.now(),
    }))

    for (const client of clients) {
        if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({
                type: "system",
                message: `新しいユーザーが参加しました（現在 ${clients.size} 人）`,
                timestamp: Date.now(),
            }))
        }
    }

    ws.on('message', (data, isBinary) => {
        if (isBinary) {
            for (const client of clients) {
                if (client.readyState === 1) {
                    client.send(data, { binary: true });
                }
            }
        } else {
            const message = JSON.parse(data.toString());
            console.log(`Received: ${message.text} from ${message.user}`);

            const broadcast = JSON.stringify({
                ...message,
                timestamp: Date.now(),
            });

            for (const client of clients) {
                if (client.readyState === 1) {
                    client.send(broadcast);
                }
            }
        }
    })

    ws.on('pong', () => {
        ws.isAlive = true;
    })

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected. Total: ${clients.size}`);

        for (const client of clients) {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    type: "system",
                    message: `ユーザーが退出しました（現在 ${clients.size} 人）`,
                    timestamp: Date.now(),
                }))
            }
        }
    })

    ws.on('error', (err) => {
        console.error("WebSocket error:", err.message);
    })
})

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    })
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
    console.log("WebSocket server closed");
});

const PORT = 3001;

server.listen(PORT, () => {
    console.log(`HTTP + WebSocket server running on port ${PORT}`);
});
