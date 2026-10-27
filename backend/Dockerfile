FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate --schema prisma/auth.schema && npx prisma generate --schema prisma/core.schema
COPY src ./src
COPY tests ./tests
CMD ["node", "src/gateway/server.js"]
