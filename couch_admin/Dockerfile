#FROM node:19-bullseye-slim
#Use specific node version alpine is not the best choice

#RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
#Install dumb-init tool

#ENV NODE_ENV production
#Use explicit production environment

#WORKDIR /usr/src/app

#COPY --chown=node:node . /usr/src/app
#Run the application as node user not root

#COPY . /usr/src/app
#RUN npm install

#RUN npm i --package-lock-only
#Run production only
#RUN npm ci --only=production

#USER node
#CMD "npm" "start"

#CMD ["dumb-init", "node", "server.js"]
#Use dumb-init as start point


#Multistage build

# --------------> The build image
FROM node:19-bullseye-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm i --package-lock-only --omit=dev
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --omit=dev && npm cache clean --force
 
# --------------> The production image
FROM node:19-bullseye-slim AS production

ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app

#curl is no more part of the image so command will fail
#HEALTHCHECK CMD curl --fail http://localhost:8090/ok || exit 1 
HEALTHCHECK CMD node hck.js

CMD ["dumb-init", "node", "worker.js"]
