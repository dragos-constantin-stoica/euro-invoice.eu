#Multistage build

# --------------> The build image
FROM node:20-bullseye-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm i --package-lock-only --omit=dev
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/secrets.app npm ci --omit=dev && npm cache clean --force
 
# --------------> The production image
FROM node:20-bullseye-slim AS production

ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app

#curl is no more part of the image so command will fail
HEALTHCHECK CMD node hck.js

CMD ["dumb-init", "node", "worker.js"]
