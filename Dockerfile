FROM node:16

LABEL maintainer='grumbeard'

COPY package* ./

RUN npm install

COPY . .

RUN chmod +x ./start.sh