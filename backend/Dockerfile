# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the application (if necessary)
# RUN npm run build

# Expose the port the app runs on
ENV PORT=${PORT:-3000}
EXPOSE $PORT

# Define the command to run the app
CMD ["npm", "start"]
