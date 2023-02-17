FROM node:lts-alpine3.16

COPY ./app/package.json ./

RUN npm install 

EXPOSE 8080

# CMD [ "node", "server.js" ]
CMD npm run dev