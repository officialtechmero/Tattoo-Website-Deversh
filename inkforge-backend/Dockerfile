FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./

RUN npm install --omit=dev

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]