FROM cgr.dev/chainguard/node:latest-dev AS build

USER root
WORKDIR /app
COPY package.json package-lock.json ./
RUN attempt=1; \
	until npm ci; do \
		if [ "$attempt" -ge 5 ]; then exit 1; fi; \
		echo "npm ci failed (attempt ${attempt}), retrying..."; \
		sleep $((attempt * 5)); \
		attempt=$((attempt + 1)); \
	done

COPY . .
# The engines package hides a failed schema-engine download. Generate does not
# need that binary; migrate deploy does, and then the container exits 1.
RUN if [ ! -e /usr/lib/libssl.so.3 ] && [ ! -e /lib/libssl.so.3 ]; then apk add --no-cache libssl3; fi
RUN attempt=1; \
	until node scripts/ensure-prisma-engine.mjs; do \
		if [ "$attempt" -ge 5 ]; then exit 1; fi; \
		echo "Prisma schema engine unavailable (attempt ${attempt}), retrying..."; \
		sleep $((attempt * 5)); \
		attempt=$((attempt + 1)); \
	done
RUN npm run db:generate && npm run build
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
ENTRYPOINT []

FROM build AS migration
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && npm run db:seed"]

# Prune the install the build stage already completed. A second npm ci has to
# reach the registry, and one DNS failure there aborts the web image.
FROM build AS production-dependencies

ENV NODE_ENV=production
RUN npm prune --omit=dev --offline && npm cache clean --force

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
