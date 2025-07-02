# FROM imbios/bun-node:1.0.30-21.7.1-alpine AS base
# FROM oven/bun:1.1.8-alpine AS base
# FROM --platform=$BUILDPLATFORM oven/bun:1.0.31-alpine AS base
# FROM oven/bun:1.0.31 AS base-server
# FROM oven/bun:1.0.31 AS base-client
FROM --platform=$BUILDPLATFORM node:lts-slim AS base
RUN npm i -g bun@1.2.17
COPY  bun.lock /app/bun.lock
COPY . /app
WORKDIR /app
RUN bun install

FROM base AS server
# RUN npm i -g bun
RUN rm -r /app/clients
WORKDIR /app/servers/server
CMD ["bun", "run", "start:prod"]


FROM base AS client-hibiz-react-build
WORKDIR /app/clients/client-hibiz-react
RUN bun run bundle:test

FROM nginx:alpine AS client-hibiz-react
COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/dist /usr/share/nginx/html
COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



FROM base AS client-hitable-react-build
WORKDIR /app/clients/client-hitable-react
RUN bun run bundle:test

FROM nginx:alpine AS client-hitable-react
COPY --from=client-hitable-react-build /app/clients/client-hitable-react/dist /usr/share/nginx/html
COPY --from=client-hitable-react-build /app/clients/client-hitable-react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]