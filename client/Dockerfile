FROM node:10.16.2

RUN npm install -g http-server

COPY ./ /app

WORKDIR /app

RUN npm install
RUN npm run build-prod

WORKDIR /app/dist

CMD http-server . -p 4200
