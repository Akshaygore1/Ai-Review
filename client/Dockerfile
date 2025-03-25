FROM node:22-alpine

WORKDIR /app

# Ensure package.json is copied
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port for development server
EXPOSE 5173

# Start the Vite development server
CMD [ "npm", "run", "dev" ]
