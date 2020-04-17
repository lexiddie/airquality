FROM alpine:latest

RUN apk add --no-cache make gcc g++ python
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8081 

CMD [ "npm", "start" ]