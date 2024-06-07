FROM node:18.14.2-alpine3.17

# RUN apk add g++ make py3-pip

WORKDIR /app
COPY package.json .

RUN npm install
COPY . .
# RUN npm run build

CMD ["npm","run", "dev"]

