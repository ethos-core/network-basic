# network-basic

Hands-on networking labs corresponding to the "Internet" section of the [Frontend Developer Roadmap](https://roadmap.sh/frontend).

Spin up HTTP and DNS servers locally with Docker, then send real requests to observe how each protocol works.

## Topics Covered

| roadmap.sh Topic | Directory |
|---|---|
| What is HTTP? | `http/` |
| What is a Domain Name? / DNS and how it works | `dns/` |

## Prerequisites

- Docker / Docker Compose

## Directory Structure

```
.
├── http/                # HTTP lab
│   ├── docker-compose.yml
│   ├── nginx.conf       # Nginx config (headers, caching, redirects, API)
│   └── www/
│       ├── index.html
│       └── 404.html
└── dns/                 # DNS lab
    ├── docker-compose.yml
    ├── dns/
    │   ├── Corefile      # CoreDNS config
    │   └── zones/
    │       └── mylab.local   # Zone file (A / CNAME / NS / SOA records)
    └── sites/
        ├── app1/index.html
        └── app2/index.html
```

## Usage

### HTTP Lab

Start Nginx and explore status codes, headers, and redirects.

```bash
cd http
docker compose up -d
```

```bash
# Basic response
curl -i http://localhost:8080/

# Inspect custom headers
curl -I http://localhost:8080/

# Redirect (301)
curl -i http://localhost:8080/old-page

# JSON API (various status codes)
curl http://localhost:8080/api/hello        # 200 OK
curl http://localhost:8080/api/created      # 201 Created
curl http://localhost:8080/api/no-content   # 204 No Content
curl http://localhost:8080/api/rate-limit   # 429 Too Many Requests
curl http://localhost:8080/api/error        # 500 Internal Server Error

# HTTP method restriction
curl -X DELETE http://localhost:8080/api/data   # 405 Method Not Allowed

# Custom 404 page
curl http://localhost:8080/nonexistent
```

Stop:

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
# A record lookup
dig @127.0.0.1 -p 15353 app1.mylab.local
dig @127.0.0.1 -p 15353 app2.mylab.local

# CNAME record
dig @127.0.0.1 -p 15353 www.mylab.local

# NS record
dig @127.0.0.1 -p 15353 mylab.local NS

# External domain forwarding
dig @127.0.0.1 -p 15353 google.com
```

Stop:

```bash
docker compose down
```

## References

- [roadmap.sh - Frontend Developer](https://roadmap.sh/frontend)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [CoreDNS Manual](https://coredns.io/manual/toc/)
