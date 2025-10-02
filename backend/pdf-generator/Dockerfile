
# Use a base with Chromium installed (node:18-bullseye)
FROM public.ecr.aws/docker/library/node:18-bullseye

# Install dependencies for headless Chrome
RUN apt-get update && apt-get install -y     ca-certificates     fonts-liberation     libasound2     libatk-bridge2.0-0     libnspr4     libnss3     libxss1     libx11-xcb1     libxcomposite1     libxdamage1     libxrandr2     libgbm1     libgtk-3-0     wget --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

EXPOSE 8080

CMD ["node", "handler.js"]
