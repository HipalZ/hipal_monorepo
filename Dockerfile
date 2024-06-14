FROM node:21 AS base
RUN npm install -g pnpm
COPY package.json /app/package.json
COPY . /app
WORKDIR /app
RUN pnpm install

FROM base AS dishes-server
WORKDIR /app/servers/dishes
CMD ["pnpm", "run", "start:development"]

FROM base AS businesses-server
WORKDIR /app/servers/businesses
CMD ["pnpm", "run", "start:development"]

FROM base AS categories-server
WORKDIR /app/servers/categories
CMD ["pnpm", "run", "start:development"]

FROM base AS kitchens-server
WORKDIR /app/servers/kitchens
CMD ["pnpm", "run", "start:development"]

FROM base AS payments-server
WORKDIR /app/servers/payments
CMD ["pnpm", "run", "start:development"]

FROM base AS settings-server
WORKDIR /app/servers/settings
CMD ["pnpm", "run", "start:development"]

FROM base AS users-server
WORKDIR /app/servers/users
CMD ["pnpm", "run", "start:development"]

FROM base AS zones-server
WORKDIR /app/servers/zones
CMD ["pnpm", "run", "start:development"]

FROM base AS client-hibiz-react-build
WORKDIR /app/clients/client-hibiz-react
RUN pnpm run bundle:development

FROM nginx:alpine AS client-hibiz-react
COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/dist /usr/share/nginx/html
COPY --from=client-hibiz-react-build /app/clients/client-hibiz-react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM base AS client-hikitchen-react-build
WORKDIR /app/clients/client-hikitchen-react
RUN pnpm run bundle:development

FROM nginx:alpine AS client-hikitchen-react
COPY --from=client-hikitchen-react-build /app/clients/client-hikitchen-react/dist /usr/share/nginx/html
COPY --from=client-hikitchen-react-build /app/clients/client-hikitchen-react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM base AS client-hitable-react-build
WORKDIR /app/clients/client-hitable-react
RUN pnpm run bundle:development

FROM nginx:alpine AS client-hitable-react
COPY --from=client-hitable-react-build /app/clients/client-hitable-react/dist /usr/share/nginx/html
COPY --from=client-hitable-react-build /app/clients/client-hitable-react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]