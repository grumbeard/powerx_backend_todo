FROM node:16-alpine

LABEL maintainer='grumbeard'

COPY package* ./

RUN npm install

COPY . .