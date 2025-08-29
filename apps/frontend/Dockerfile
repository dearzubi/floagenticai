FROM node:24.7.0-alpine3.21 AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY packages/common ./packages/common
COPY apps/frontend ./apps/frontend

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_API_BASE_URL
ARG VITE_ASSETS_BASE_URL
ARG VITE_DISABLE_API_CACHING
ARG VITE_SOCKET_IO_URL

ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ASSETS_BASE_URL=${VITE_ASSETS_BASE_URL}
ENV VITE_DISABLE_API_CACHING=${VITE_DISABLE_API_CACHING}
ENV VITE_SOCKET_IO_URL=${VITE_SOCKET_IO_URL}

RUN pnpm --filter common build
RUN pnpm --filter frontend build

FROM nginx:alpine3.22 AS production

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=base /app/apps/frontend/dist /usr/share/nginx/html

RUN addgroup -g 1001 -S nginx && \
    adduser -S frontend -u 1001 -G nginx

RUN chown -R frontend:nginx /var/cache/nginx && \
    chown -R frontend:nginx /var/log/nginx && \
    chown -R frontend:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R frontend:nginx /var/run/nginx.pid && \
    chown -R frontend:nginx /usr/share/nginx/html

USER frontend

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
