FROM node:20-alpine as BUILDER

# Set the working directory
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN ls -la

# Build the project

RUN yarn build

# runner
FROM node:20-alpine as RUNNER

WORKDIR /app

COPY --from=BUILDER /app/node_modules ./node_modules
COPY --from=BUILDER /app/package.json ./package.json
COPY --from=BUILDER /app/dist ./dist


# Expose the port your app runs on
EXPOSE 4000


# Start the application using nodemon for development (as non-root user)
CMD [ "node", "dist/main.js" ]