FROM node:17-slim

RUN apt-get update \
  && apt-get install -y sox libsox-fmt-mp3

WORKDIR /js_expert_06/

COPY package.json package-lock.json /js_expert_06/

RUN npm ci --silent

COPY . .

USER node

CMD npm run dev

