# Dokerfile for the fragments microservice 

# Stage 0: install the base dependencies
FROM node:16.14-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b AS dependencies

LABEL maintainer="Gulnur Baimukhambetova <gbaimukhambetova@myseneca.ca>"
LABEL description="Fragments node.js microservice"

#Install dumb-init curl
RUN apk update && apk add --upgrade dumb-init

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package*.json ./

# Install node dependencies defined in package-lock.json
# Only the ones for production
RUN npm ci --only=production

#######################################################################

# Stage 1: build the site using dependencies 
FROM node:16.14-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b AS production

# Optimize for production
ENV NODE_ENV=production
# We default to use port 8080 in our service
ENV PORT=8080
# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Copy the init process  and curl from the previous stage 
COPY --from=dependencies /usr/bin/dumb-init /usr/bin/dumb-init

# Run with least possible privilege
USER node

# Use /app as our working directory
WORKDIR /app

# Copy the dependencies from the previous stage 
COPY --chown=node:node --from=dependencies /app ./
# Copy src to /app/src/
COPY --chown=node:node ./src ./src
# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

## Set etnrypoint to the init process 
ENTRYPOINT ["dumb-init", "--"]
# Start the container by running our server
CMD ["node", "src/server.js"]

# We run our service on port 8080
EXPOSE 8080

# Set healthcheck for the server
HEALTHCHECK  --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1
