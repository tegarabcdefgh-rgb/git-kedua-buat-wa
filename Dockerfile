# Use official Node image
FROM node:18-slim

# Install system deps: python3, pip, ffmpeg
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 \
       python3-pip \
       ffmpeg \
       ca-certificates \
    && python3 -m pip install -U pip setuptools \
    && python3 -m pip install -U yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy rest of the app
COPY . .

# Expose port (Railway will override with $PORT)
EXPOSE 3000

ENV PORT=3000

CMD ["npm", "run", "start-server"]
