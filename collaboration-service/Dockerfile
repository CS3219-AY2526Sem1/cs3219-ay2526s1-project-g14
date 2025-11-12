FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production || npm install --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 5051

CMD ["node", "src/index.js"]

