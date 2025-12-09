FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 

# Copy source files
COPY . ./

# Build TypeScript (if needed)
# RUN npm i typescript && npm run build
RUN --mount=type=secret,id=npm_token \
  npm i typescript  && npm run build

# Production image
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/src/app.js"]
