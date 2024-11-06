# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.27 AS base
WORKDIR /usr/src/app

# Build frontend project
FROM base AS build-frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && bun install
COPY frontend ./frontend
RUN cd frontend && bun run build && cp -r .next/standalone/* .

# Build parse-network project
FROM base AS build-parse-network
COPY parse-network/package*.json ./parse-network/
RUN cd parse-network && bun install
COPY parse-network ./parse-network
RUN cd parse-network && bun run build

# Build printer project
FROM base AS build-printer
COPY printer/package*.json ./printer/
RUN cd printer && bun install
COPY printer ./printer
RUN cd printer && bun run build

# Build queue-manager project
FROM base AS build-queue-manager
COPY queue-manager/package*.json ./queue-manager/
RUN cd queue-manager && bun install
COPY queue-manager ./queue-manager
RUN cd queue-manager && bun run build

# Build renderer project
FROM base AS build-renderer
COPY renderer/package*.json ./renderer/
RUN cd renderer && bun install
COPY renderer ./renderer
RUN cd renderer && bun run build && cp -r .next/standalone/* .

# Final stage
FROM oven/bun:1.1.27-alpine AS final

# Set working directory
WORKDIR /usr/src/app

RUN apk add --no-cache zip rsync chromium-swiftshader
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy built projects into final image
COPY --from=build-frontend /usr/src/app/frontend ./frontend
COPY --from=build-parse-network /usr/src/app/parse-network ./parse-network
COPY --from=build-printer /usr/src/app/printer ./printer
COPY --from=build-queue-manager /usr/src/app/queue-manager ./queue-manager
COPY --from=build-renderer /usr/src/app/renderer ./renderer

# Expose necessary ports (assuming each project runs on a different port)
EXPOSE 3000

# Start all projects (assuming they can be started in parallel)
CMD cd frontend && bun server.js