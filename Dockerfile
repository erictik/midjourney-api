FROM node:alpine

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

COPY package.json ./

USER node

RUN npm install --only=production

# COPY --chown=node:node . .

EXPOSE 3000
