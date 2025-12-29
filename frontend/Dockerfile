FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

ENV NODE_ENV=development

CMD ["/bin/sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
