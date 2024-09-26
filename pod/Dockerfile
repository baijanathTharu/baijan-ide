FROM node:20-alpine as BUILDER

# Install necessary packages including and other build tools
RUN apt-get update && \
  apt-get install -y curl bash python3 make gcc g++ build-essential && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

# Build the project

RUN npx tsc

# runner
FROM node:20-alpine as RUNNER

WORKDIR /app

COPY --from=BUILDER /app/node_modules ./node
COPY --from=BUILDER /app/package.json ./package.json
COPY --from=BUILDER /app/dist ./dist

# Expose the port your app runs on
EXPOSE 3000


# Start the application using nodemon for development (as non-root user)
CMD [ "node", "dist/main.js" ]