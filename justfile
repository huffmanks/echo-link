BASE_COMPOSE := "docker compose -f docker-compose.yml"
BUILDER := "echolink-builder"
IMAGE_NAME := "huffmanks/echo-link"
VERSION := `node -p "require('./package.json').version"`

# --- Public Recipes ---

default:
    @just --list

# Start environment (e.g., just up production)
up profile="development":
    @test -f .env.{{profile}} || (echo "Error: .env.{{profile}} missing!" && exit 1)
    @echo "Starting {{profile}} environment..."
    @just -E .env.{{profile}} _up-{{profile}}

# Stop environment (default: development)
down profile="development":
    @echo "Stopping {{profile}} environment..."
    @just -E .env.{{profile}} _down-{{profile}}

# Setup pre-reqs
init:
    @for env in development staging production; do \
        if [ ! -f .env.$env ]; then \
            cp .example.env.$env .env.$env; \
            echo "Created .env.$env"; \
        else \
            echo ".env.$env already exists, skipping..."; \
        fi; \
    done

# Build the docker image
build push="false":
    @echo "Building docker image version {{VERSION}}..."
    @docker buildx ls | grep -q {{BUILDER}} || docker buildx create --name {{BUILDER}} --driver docker-container
    docker buildx inspect --bootstrap
    docker buildx use {{BUILDER}}
    {{ if push == "true" { \
        "docker buildx build --platform linux/amd64,linux/arm64 " + \
        "-t " + IMAGE_NAME + ":" + VERSION + " " + \
        "-t " + IMAGE_NAME + ":latest --push ." \
    } else { \
        "docker buildx build -t " + IMAGE_NAME + ":local" + " --load ." \
    } }}
    @docker buildx rm {{BUILDER}} || true
    @echo "Build complete."

# --- Internal Helpers ---
_up-development:
    {{BASE_COMPOSE}} up -d linkding
    pnpm dev

_up-staging:
    {{BASE_COMPOSE}} up -d linkding
    pnpm staging

_up-production:
    {{BASE_COMPOSE}} up -d

_down-development:
    {{BASE_COMPOSE}} down

_down-staging:
    {{BASE_COMPOSE}} down

_down-production:
    {{BASE_COMPOSE}} down
