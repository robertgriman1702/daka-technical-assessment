FROM node:20-alpine
RUN apk add --no-cache git bash
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["/bin/sh", "-c", "npm install && npm run start:dev"]