# Normal Node.js image for local development
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["node", "server.js"]
