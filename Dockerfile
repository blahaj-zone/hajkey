# syntax = docker/dockerfile:1.2
## Install dev and compilation dependencies, build files
FROM alpine:3.18 as build
WORKDIR /iceshrimp

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk vips-dev python3 nodejs-current npm rust cargo vips

# Copy only the cargo dependency-related files first, to cache efficiently
COPY packages/backend/native-utils/Cargo.toml packages/backend/native-utils/Cargo.toml
COPY packages/backend/native-utils/Cargo.lock packages/backend/native-utils/Cargo.lock
COPY packages/backend/native-utils/src/lib.rs packages/backend/native-utils/src/
COPY packages/backend/native-utils/migration/Cargo.toml packages/backend/native-utils/migration/Cargo.toml
COPY packages/backend/native-utils/migration/src/lib.rs packages/backend/native-utils/migration/src/

# Install cargo dependencies
RUN --mount=type=cache,target=/root/.cargo cargo fetch --locked --manifest-path /iceshrimp/packages/backend/native-utils/Cargo.toml

# Copy only the dependency-related files first, to cache efficiently
COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/iceshrimp-js/package.json packages/iceshrimp-js/package.json
COPY packages/megalodon/package.json packages/megalodon/package.json
COPY packages/backend/native-utils/package.json packages/backend/native-utils/package.json
COPY packages/backend/native-utils/npm/linux-x64-musl/package.json packages/backend/native-utils/npm/linux-x64-musl/package.json
COPY packages/backend/native-utils/npm/linux-arm64-musl/package.json packages/backend/native-utils/npm/linux-arm64-musl/package.json

# Prepare yarn cache
COPY .yarn/cache .yarn/cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache cp -Tr .yarncache .yarn

# Configure corepack and yarn, and install dev mode dependencies for compilation
RUN corepack enable && corepack prepare yarn@stable --activate && yarn

# Save yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache rm -rf .yarncache/* && cp -Tr .yarn .yarncache

# Copy in the rest of the files to compile
COPY . ./

# Fix napi-rs jank
RUN --mount=type=cache,target=/iceshrimp/.napi_buildcache cp -Tr /iceshrimp/.napi_buildcache /iceshrimp/packages/backend/native-utils/built
RUN --mount=type=cache,target=/iceshrimp/packages/backend/native-utils/target if [[ ! -f /iceshrimp/packages/backend/native-utils/built/index.js ]]; then rm -rf /iceshrimp/packages/backend/native-utils/target/release; fi

# Build the thing
RUN --mount=type=cache,target=/root/.cargo --mount=type=cache,target=/iceshrimp/packages/backend/native-utils/target env NODE_ENV=production sh -c "yarn build && yarn gulp"

# Fix napi-rs jank (part 2)
RUN --mount=type=cache,target=/iceshrimp/.napi_buildcache cp -Tr /iceshrimp/packages/backend/native-utils/built /iceshrimp/.napi_buildcache

# Prepare yarn cache (production)
RUN --mount=type=cache,target=/iceshrimp/.yarncache_prod cp -Tr .yarncache_prod .yarn

# Trim down the dependencies to only those for production
RUN yarn workspaces focus --all --production

# Save yarn cache (production)
RUN --mount=type=cache,target=/iceshrimp/.yarncache_prod rm -rf .yarncache_prod/* && cp -Tr .yarn .yarncache_prod

## Runtime container
FROM alpine:3.18
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg vips-dev zip unzip nodejs-current

COPY . ./

COPY --from=build /iceshrimp/packages/megalodon /iceshrimp/packages/megalodon

# Copy node modules
COPY --from=build /iceshrimp/.yarn /iceshrimp/.yarn

# Copy the finished compiled files
COPY --from=build /iceshrimp/built /iceshrimp/built
COPY --from=build /iceshrimp/packages/backend/built /iceshrimp/packages/backend/built
COPY --from=build /iceshrimp/packages/backend/assets/instance.css /iceshrimp/packages/backend/assets/instance.css
COPY --from=build /iceshrimp/packages/backend/native-utils/built /iceshrimp/packages/backend/native-utils/built

RUN corepack enable && corepack prepare yarn@stable --activate
ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "run", "migrateandstart" ]
