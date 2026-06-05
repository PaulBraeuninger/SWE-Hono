# syntax=docker.io/docker/dockerfile-upstream:1.23.0
# check=error=true

ARG BUN_VERSION=1.3.13

FROM oven/bun:${BUN_VERSION}-slim AS dist

WORKDIR /app

# https://docs.docker.com/engine/reference/builder/#run---mounttypebind
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  --mount=type=cache,target=/root/.bun <<EOF
  bun install --frozen-lockfile --production
EOF

FROM dhi.io/bun:${BUN_VERSION}-debian13 AS final

WORKDIR /opt/app

USER nonroot

COPY --chown=nonroot:nonroot package.json ./
COPY --from=dist --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot src ./src

# Anzeige bei "docker inspect ..."
# https://specs.opencontainers.org/image-spec/annotations
# https://spdx.org/licenses
# MAINTAINER ist deprecated https://docs.docker.com/engine/reference/builder/#maintainer-deprecated
LABEL org.opencontainers.image.title="library" \
  org.opencontainers.image.description="Appserver library mit 'hardened' Basis-Image Bun und Debian 13" \
  org.opencontainers.image.version="2026.4.1-trixie" \
  org.opencontainers.image.licenses="GPL-3.0-or-later" \
  org.opencontainers.image.authors="brpa1033@h-ka.de"

EXPOSE 3000
EXPOSE 3030

# Binding fuer alle Netzwerk-Interfaces
ENV BUN_BIND_HOST=0.0.0.0

# Bei CMD statt ENTRYPOINT kann das Kommando bei "docker run ..." ueberschrieben werden
# "Array Syntax" damit auch <Strg>C funktioniert
ENTRYPOINT ["bun", "run", "src/index.mts"]
