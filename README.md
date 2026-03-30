# EchoLink

![Screenshot of EchoLink interface.](https://huffmanks.com/portfolio/images/projects/echo-link.png)

A self-hosted client app for Linkding, designed for a fast, clean and modern bookmarking experience across your devices.

## Features

- Clean, responsive interface.
- Seamless integration with Linkding API.
- Bookmark search, filtering and organization.
- Mobile-friendly and optimized for quick access.
- Self-hosted and privacy-focused.

## Usage

### docker-compose.yml

```yaml
services:
  linkding:
    image: sissbruecker/linkding:latest
    container_name: linkding
    ports:
      - "9090:9090"
    volumes:
      - ./data:/etc/linkding/data
    environment:
      LD_CSRF_TRUSTED_ORIGINS: ${LD_CSRF_TRUSTED_ORIGINS}
      LD_USE_X_FORWARDED_HOST: "true"
      # optional
      LD_SUPERUSER_NAME: ${LD_SUPERUSER_NAME}
      LD_SUPERUSER_PASSWORD: ${LD_SUPERUSER_PASSWORD}
    restart: unless-stopped
  echo-link:
    image: huffmanks/echo-link:latest
    container_name: echo-link
    ports:
      - "${APP_PORT}:${APP_PORT}"
    environment:
      APP_PORT: ${APP_PORT}
      LINKDING_CONTAINER_URL: ${LINKDING_CONTAINER_URL}
      LINKDING_API_TOKEN: ${LINKDING_API_TOKEN}
    depends_on:
      - linkding
    restart: unless-stopped
```

### .env

```txt
# --- ECHOLINK ---
APP_PORT=3000
LINKDING_CONTAINER_URL=http://linkding:9090
LINKDING_API_TOKEN=

# Optional
VITE_USER_NAME=
VITE_LINKDING_EXTERNAL_URL=http://localhost:9090

# --- LINKDING ---
# see https://linkding.link/options/#ld_csrf_trusted_origins
LD_CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://echo.lan.domain.com

# Optional
LD_SUPERUSER_NAME=
LD_SUPERUSER_PASSWORD=
```

## Start container

```sh
docker compose up -d
```

## Open web UI

```sh
open http://localhost:3002
```
