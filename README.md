# network-basic

Hands-on networking labs corresponding to the "Internet" section of the [Frontend Developer Roadmap](https://roadmap.sh/frontend).

Spin up HTTP, DNS, TLS, and other network services locally with Docker, then send real requests to observe how each protocol works.

## Topics Covered

| roadmap.sh Topic | Directory | Description |
|---|---|---|
| What is HTTP? | `http/` | Status codes, headers, redirects, JSON API |
| What is a Domain Name? / DNS and how it works | `dns/` | CoreDNS with custom zone, A/CNAME/NS records |
| What is Hosting? / HTTPS & TLS | `https-tls/` | HTTP→HTTPS redirect, TLS 1.2/1.3, HSTS |
| Certificates | `certs/` | Self-signed certificate generation |
| HTTP/2 | `http2/` | HTTP/2 over TLS with multiplexing demo |
| Reverse Proxy | `reverse-proxy/` | Nginx load balancing across multiple backends |
| WebSocket | `websocket/` | Real-time chat with ping/pong heartbeat |
| CORS | `cors/` | Cross-origin requests, preflight, credentials |
| Caching | `cache/` | Cache-Control, ETag, stale-while-revalidate |
| Packet Capture | `packet-capture/` | tcpdump / Wireshark on container traffic |

## Prerequisites

- Docker / Docker Compose
- `curl`, `dig` (for DNS lab)
- `openssl` (for TLS/HTTP2 labs — certificate generation)

## Port Map

Labs share host ports. Run **one lab at a time** or change ports to avoid conflicts.

| Port | Labs |
|---|---|
| 8080 | http, https-tls, reverse-proxy, cors (frontend), cache, packet-capture |
| 8443 | https-tls, http2 |
| 3000 | cors (API) |
| 3001 | websocket |
| 15353 | dns |

## Directory Structure

```
.
├── http/                  # HTTP basics lab
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── www/
├── dns/                   # DNS lab
│   ├── docker-compose.yml
│   ├── dns/
│   │   ├── Corefile
│   │   └── zones/
│   └── sites/
├── https-tls/             # HTTPS & TLS lab
│   ├── docker-compose.yml
│   ├── nginx-https.conf
│   ├── certs/             # generated certs (gitignored)
│   └── www/
├── certs/                 # shared cert directory (gitignored)
├── http2/                 # HTTP/2 lab
│   ├── docker-compose.yml
│   ├── nginx-h2.conf
│   └── certs/
├── reverse-proxy/         # reverse proxy & load balancing lab
│   ├── docker-compose.yml
│   ├── nginx-lb.conf
│   └── backends/
├── websocket/             # WebSocket lab
│   ├── docker-compose.yml
│   ├── server/
│   └── client/
├── cors/                  # CORS lab
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── api-server/
│   └── frontend/
├── cache/                 # HTTP caching lab
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── www/
└── packet-capture/        # packet capture lab
    ├── docker-compose.yml
    └── www/
```

## Usage

### HTTP Lab

Start Nginx and explore status codes, headers, and redirects.

```bash
cd http
docker compose up -d
```

```bash
curl -i http://localhost:8080/
curl -I http://localhost:8080/
curl -i http://localhost:8080/old-page          # 301 redirect
curl http://localhost:8080/api/hello             # 200
curl http://localhost:8080/api/created           # 201
curl http://localhost:8080/api/no-content        # 204
curl http://localhost:8080/api/rate-limit        # 429
curl http://localhost:8080/api/error             # 500
curl -X DELETE http://localhost:8080/api/data    # 405
curl http://localhost:8080/nonexistent           # custom 404
```

```bash
docker compose down
```

### DNS Lab

Run CoreDNS with a custom domain `mylab.local` and explore name resolution.

```bash
cd dns
docker compose up -d
```

```bash
dig @127.0.0.1 -p 15353 app1.mylab.local       # A record
dig @127.0.0.1 -p 15353 app2.mylab.local       # A record
dig @127.0.0.1 -p 15353 www.mylab.local        # CNAME
dig @127.0.0.1 -p 15353 mylab.local NS         # NS record
dig @127.0.0.1 -p 15353 google.com             # forwarding
```

```bash
docker compose down
```

### HTTPS & TLS Lab

Observe HTTP→HTTPS redirect, TLS handshake, and HSTS header.

```bash
cd https-tls

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/CN=localhost"

docker compose up -d
```

```bash
curl -i http://localhost:8080/                          # 301 → HTTPS
curl -k https://localhost:8443/                         # TLS response
curl -kI https://localhost:8443/                        # HSTS header
openssl s_client -connect localhost:8443 -servername localhost   # TLS info
```

```bash
docker compose down
```

### HTTP/2 Lab

Compare HTTP/2 multiplexing with HTTP/1.1.

```bash
cd http2

# Generate certificate (if not done)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/CN=localhost"

docker compose up -d
```

```bash
curl -k --http2 https://localhost:8443/api/fast
curl -k --http2 https://localhost:8443/api/slow
curl -k --http1.1 https://localhost:8443/api/fast       # compare with HTTP/1.1
```

```bash
docker compose down
```

### Reverse Proxy Lab

Nginx load-balances requests across three backends (round-robin).

```bash
cd reverse-proxy
docker compose up -d
```

```bash
# Repeat to see different backends via X-Backend-Server header
curl -i http://localhost:8080/
curl -i http://localhost:8080/
curl -i http://localhost:8080/
```

```bash
docker compose down
```

### WebSocket Lab

Real-time chat server with ping/pong heartbeat and binary image transfer.

```bash
cd websocket
docker compose up -d
```

Open `http://localhost:3001/` in multiple browser tabs to chat.

```bash
curl http://localhost:3001/status                       # connection info
```

```bash
docker compose down
```

### CORS Lab

Experiment with cross-origin requests between frontend (port 8080) and API (port 3000).

```bash
cd cors
docker compose up -d
```

Open `http://localhost:8080/` and use the experiment buttons. Check the DevTools Network tab to observe preflight OPTIONS requests and CORS headers.

```bash
docker compose down
```

### Cache Lab

Explore Cache-Control, ETag, and stale-while-revalidate strategies.

```bash
cd cache
docker compose up -d
```

```bash
curl -I http://localhost:8080/                          # no-cache (HTML)
curl -I http://localhost:8080/styles.css                # max-age + SWR
curl -I http://localhost:8080/logo.png                  # immutable
curl -I http://localhost:8080/api-data.json             # no-cache + ETag
```

Open `http://localhost:8080/` in DevTools Network and reload to observe cache behavior.

```bash
docker compose down
```

### Packet Capture Lab

Capture raw HTTP packets between containers with tcpdump.

```bash
cd packet-capture
docker compose up -d
```

```bash
# Send a request from the client container
docker compose exec client curl http://web/

# Capture packets (run in another terminal)
docker compose exec client sh -c "apk add --no-cache tcpdump && tcpdump -i any -A host web"
```

```bash
docker compose down
```

## References

- [roadmap.sh - Frontend Developer](https://roadmap.sh/frontend)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [CoreDNS Manual](https://coredns.io/manual/toc/)
- [MDN - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN - WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
