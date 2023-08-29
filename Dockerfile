FROM node:18.12.1

WORKDIR /home/node/app
COPY package*.json /home/node/app/
RUN npm install

CMD npm start
EXPOSE 9000
