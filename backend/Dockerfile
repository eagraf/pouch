# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm ci

# Install TypeScript globally
RUN npm install -g typescript

# Build the application
RUN npm run build

# Build the application (if necessary)
# RUN npm run build

# Expose the port the app runs on
ENV PORT=${PORT:-3000}
EXPOSE $PORT

# Define the command to run the app
CMD ["npm", "run", "start:dist"]
