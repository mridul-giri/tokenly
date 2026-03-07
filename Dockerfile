FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@latest-10

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start:docker"]