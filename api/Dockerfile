FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]


