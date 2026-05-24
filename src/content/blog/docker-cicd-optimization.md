---
title: "How I Reduced Microservice Deployment Time by 80%"
date: "Apr 20, 2026"
readTime: "5 min read"
tags: ["Docker", "CI/CD", "Jenkins", "Kubernetes"]
summary: "A practical guide to speed up microservice build and deployment pipelines by utilizing Docker multi-stage builds, cache mounting, and parallel execution."
coverImage: "/images/docker_cicd.png"
author: "Bhagaban Ghadai"
---

In my role as a backend engineer, one of my key contributions was optimizing our microservice CI/CD pipelines. Our builds were painfully slow, taking over 15 minutes per service. By focusing on containerization efficiency, we managed to slice this down to under 3 minutes.

## 1. Master the Layer Cache

The biggest bottleneck in Docker builds is rebuilding node modules or pip dependencies on every code change. You can avoid this by placing the dependency installation steps *before* copying the actual source code. Docker will cache the dependency installation layer and skip it unless your `package.json` or `requirements.txt` changes.

## 2. Leverage Docker Multi-Stage Builds

Never ship your development dependencies, compilers, or build tools to production. Multi-stage builds allow you to use a heavy image with all the build tooling to compile/install, and then copy only the production-ready assets into a lightweight runner image.

![Constructing abstract digital container cube](/images/docker_cicd.png)

```dockerfile
# --- Stage 1: Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Production runner stage ---
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]
```

## 3. Cache Mounting in CI Pipelines

In Jenkins or GitHub Actions, standard Docker builds lose their local layer cache because each runner runs in a clean environment. Using Docker's `--cache-from` option or mounting the build cache using BuildKit's `cache-to`/`cache-from` will drastically improve performance by sharing cache folders across pipelines.

> **Warning**: Always ensure your `.dockerignore` file is properly configured. If you copy your local `node_modules` or `.git` directories into the Docker build context, it will break caching and bloat the final container image!
