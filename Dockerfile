FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build the TypeScript code
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]