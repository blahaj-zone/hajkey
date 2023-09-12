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
RUN cargo fetch --locked --manifest-path /iceshrimp/packages/backend/native-utils/Cargo.toml

# Copy only the dependency-related files first, to cache efficiently
COPY package.json pnpm*.yaml ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/iceshrimp-js/package.json packages/iceshrimp-js/package.json
COPY packages/megalodon/package.json packages/megalodon/package.json
COPY packages/backend/native-utils/package.json packages/backend/native-utils/package.json
COPY packages/backend/native-utils/npm/linux-x64-musl/package.json packages/backend/native-utils/npm/linux-x64-musl/package.json
COPY packages/backend/native-utils/npm/linux-arm64-musl/package.json packages/backend/native-utils/npm/linux-arm64-musl/package.json

# Configure corepack and pnpm, and install dev mode dependencies for compilation
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm i

# Copy in the rest of the native-utils rust files
COPY packages/backend/native-utils packages/backend/native-utils/

# Compile native-utils
RUN pnpm run --filter native-utils build

# Copy in the rest of the files to compile
COPY . ./
RUN env NODE_ENV=production sh -c "pnpm run --filter '!native-utils' build && pnpm run gulp"

# Trim down the dependencies to only those for production
RUN pnpm i --prod

## Runtime container
FROM alpine:3.18
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg vips-dev zip unzip nodejs-current

COPY . ./

COPY --from=build /iceshrimp/packages/megalodon /iceshrimp/packages/megalodon

# Copy node modules
COPY --from=build /iceshrimp/node_modules /iceshrimp/node_modules
COPY --from=build /iceshrimp/packages/backend/node_modules /iceshrimp/packages/backend/node_modules
COPY --from=build /iceshrimp/packages/sw/node_modules /iceshrimp/packages/sw/node_modules
COPY --from=build /iceshrimp/packages/client/node_modules /iceshrimp/packages/client/node_modules
COPY --from=build /iceshrimp/packages/iceshrimp-js/node_modules /iceshrimp/packages/iceshrimp-js/node_modules

# Copy the finished compiled files
COPY --from=build /iceshrimp/built /iceshrimp/built
COPY --from=build /iceshrimp/packages/backend/built /iceshrimp/packages/backend/built
COPY --from=build /iceshrimp/packages/backend/assets/instance.css /iceshrimp/packages/backend/assets/instance.css
COPY --from=build /iceshrimp/packages/backend/native-utils/built /iceshrimp/packages/backend/native-utils/built

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "run", "migrateandstart" ]
