FROM node:20

# set working directory in the container
WORKDIR /code

# copy package and package-lock.json to working directory
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the code
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
