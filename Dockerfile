# Multi-stage build: build Next.js static export, serve via Nginx

FROM node:22-alpine AS deps
WORKDIR /app
# Recommended for Next.js on Alpine
RUN apk add --no-cache libc6-compat
# Install Yarn Classic via Corepack and install deps
COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
# Build will generate the static export in ./out because output:'export' in next.config.js
RUN yarn build

FROM nginx:alpine AS runner
# Copy static export to Nginx html root
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]