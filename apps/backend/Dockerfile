FROM node:24.7.0-alpine3.21 AS base

ENV HUSKY=0

RUN npm install -g pnpm

WORKDIR /app

COPY .husky ./.husky
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY apps/backend/package.json ./apps/backend/


RUN pnpm install --frozen-lockfile

COPY packages/common ./packages/common
COPY apps/backend ./apps/backend

RUN pnpm --filter common build
RUN pnpm --filter backend build

FROM node:24.7.0-alpine3.21 AS production

ENV HUSKY=0

RUN npm install -g pnpm

WORKDIR /app

COPY .husky ./.husky
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY apps/backend/package.json ./apps/backend/


RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/packages/common/dist ./packages/common/dist
COPY --from=base /app/packages/common/package.json ./packages/common/
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/package.json ./apps/backend/

COPY apps/backend/public ./apps/backend/public

RUN mkdir -p /app/apps/backend/logs && sudo chown -R 1000:1000 /app/apps/backend
USER node

EXPOSE 4000

WORKDIR /app/apps/backend

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.request('http://localhost:4000/api/health', {timeout: 2000}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1)).end()"

CMD ["node", "dist/index.js"]
