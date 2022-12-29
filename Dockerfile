FROM node:19-alpine
ENV YARN_CHECKSUM_BEHAVIOR=update
ARG NODE_ENV=production
WORKDIR /calckey

# Copy Files
COPY . ./

# Install Dependencies
RUN apk update
RUN apk add git ffmpeg tini alpine-sdk python3

# Configure corepack and yarn
RUN corepack enable
RUN yarn set version berry
RUN yarn install --immutable
RUN yarn plugin import workspace-tools

# Build project (pnp dependencies are installed)
RUN yarn run rebuild

# Remove git files
RUN rm -rf .git

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "run", "migrateandstart" ]
