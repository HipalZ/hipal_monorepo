FROM node:16.13.1-alpine3.13

# RUN apk add g++ make py3-pip

WORKDIR /app
COPY package.json .

RUN npm install
COPY . .
# RUN npm run build

CMD ["sh", "app.sh"]
