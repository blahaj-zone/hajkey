FROM alpine:3.18
RUN apk add --no-cache --no-progress git alpine-sdk vips-dev python3 nodejs-current npm rust cargo vips
RUN corepack enable && corepack prepare yarn@stable --activate
CMD ["/bin/sh"]
