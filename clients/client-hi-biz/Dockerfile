FROM node:18.14.2-alpine3.17

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if present)
COPY package.json .

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Run the build script
# RUN pnpm run build

# Expose the port your app runs on
EXPOSE 3000

# Run the application
CMD ["pnpm", "run", "dev"]
