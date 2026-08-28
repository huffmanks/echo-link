# --- STAGE 0: Build Frontend ---
FROM node:24.18.0-alpine AS frontend-builder
WORKDIR /app

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# --- STAGE 1: Build Go ---
FROM golang:1.25-alpine3.23 AS go-builder
WORKDIR /app

COPY server.go .
RUN go mod init proxy-server && \
    CGO_ENABLED=0 GOOS=linux go build -o main server.go

# --- STAGE 2: Runner ---
FROM alpine:3.23 AS runner
WORKDIR /app

COPY --from=frontend-builder /app/dist ./dist
COPY --from=go-builder /app/main .

EXPOSE ${APP_PORT}

CMD ["./main"]