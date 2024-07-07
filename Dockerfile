FROM imbios/bun-node:1.0.30-21.7.1-alpine AS base
RUN npm install -g bun
COPY  bun.lockb /app/bun.lockb
COPY . /app
WORKDIR /app
RUN bun install

FROM base AS server
RUN rm -r /app/clients
WORKDIR /app/servers/server
CMD ["bun", "run", "start"]




# FROM base AS client-hibiz-react-build
# WORKDIR /app/clients/client-hibiz-react
# RUN pnpm run bundle:production

# FROM nginx:alpine AS client-hibiz-react
# COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/dist /usr/share/nginx/html
# COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# FROM base AS client-hikitchen-react-build
# WORKDIR /app/clients/client-hikitchen-react
# RUN pnpm run bundle:production

# FROM nginx:alpine AS client-hikitchen-react
# COPY --from=client-hikitchen-react-build /app/clients/client-hikitchen-react/dist /usr/share/nginx/html
# COPY --from=client-hikitchen-react-build /app/clients/client-hikitchen-react/nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# FROM base AS client-hitable-react-build
# WORKDIR /app/clients/client-hitable-react
# RUN pnpm run bundle:production

# FROM nginx:alpine AS client-hitable-react
# COPY --from=client-hitable-react-build /app/clients/client-hitable-react/dist /usr/share/nginx/html
# COPY --from=client-hitable-react-build /app/clients/client-hitable-react/nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
