FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]


