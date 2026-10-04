FROM node:20-alpine

WORKDIR /app

# Copy root and frontend package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root dependencies
RUN npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Copy application source
COPY . .

# Build frontend production bundle
RUN npm run build

# Cloud Run dynamic port support
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
