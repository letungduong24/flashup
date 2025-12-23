FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

COPY . .

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]


