FROM node:10.16.2

COPY ./ /app

WORKDIR /app

RUN npm install
RUN npm run tsc

CMD npm run start
