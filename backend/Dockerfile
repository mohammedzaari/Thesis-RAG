FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p public/uploads && chown -R node:node /app/public
USER node
EXPOSE 3000
CMD ["node", "index.js"]
