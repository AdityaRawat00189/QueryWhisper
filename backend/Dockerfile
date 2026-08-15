# 1. Use a lightweight Node.js image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy only package files first (optimizes Docker caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port your app runs on
EXPOSE 5000

# 7. Start the application
CMD ["npm", "start"]