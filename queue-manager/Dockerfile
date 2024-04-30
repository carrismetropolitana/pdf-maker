FROM node:slim

RUN apt-get update && apt-get -y install curl

COPY . /app/

#COPY local.conf /etc/fonts/local.conf
WORKDIR /app

# Install deps for server.
RUN npm --omit=dev install

RUN npm run build

CMD ["node", "./build/index.js"]