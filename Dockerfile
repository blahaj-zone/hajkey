FROM node:19-alpine
ARG NODE_ENV=production
WORKDIR /calckey

# Copy Files
COPY . ./

# Install Dependencies
RUN apk update
RUN apk add git ffmpeg tini alpine-sdk python3

# Configure corepack and pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN pnpm i --frozen-lockfile
ARG NODE_ENV=production

# Build project (pnp dependencies are installed)
RUN pnpm run build

# Remove git files
RUN rm -rf .git

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "run", "migrateandstart" ]
