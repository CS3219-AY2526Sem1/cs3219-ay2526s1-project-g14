FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY src ./src
COPY .env.sample ./
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
