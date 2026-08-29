FROM cgr.dev/chainguard/node:latest-dev AS build

USER root
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run db:generate && npm run build
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
ENTRYPOINT []

FROM build AS migration
CMD ["npx", "prisma", "migrate", "deploy"]

FROM cgr.dev/chainguard/node:latest-dev AS production-dependencies

ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM cgr.dev/chainguard/node:latest AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/uploads ./uploads
USER node

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --retries=3 \
	CMD ["/usr/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["build"]
