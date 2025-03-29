# Use a lightweight Node.js Alpine image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install dependencies
# Copy package.json and install only production dependencies to keep the image small
COPY package*.json ./
RUN npm install --only=production

# Copy the entire backend codebase to the container
COPY . .

# Expose the port your app runs on
EXPOSE 5003

# Start the backend server
CMD ["node", "server.js"]
