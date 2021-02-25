FROM node:alpine

WORKDIR  /app

COPY . . 

RUN npm install

RUN npm run build

RUN npm prune --production

CMD ["npm", "run" , "start"] 
