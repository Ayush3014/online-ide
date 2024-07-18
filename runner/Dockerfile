FROM node:20

# Install build essentials
RUN apt-get update && apt-get install -y python3 make g++

# set working directory in the container
WORKDIR /code

# copy package and package-lock.json to working directory
COPY package*.json ./

# install dependencies
RUN npm install

# install typescript globally
RUN npm install -g typescript

# copy the rest of the code
COPY . .

# Rebuild node-pty to avoid module not install issues [due to different architecture]
RUN npm rebuild node-pty --update-binary

RUN npm run build

EXPOSE 3000 3001

CMD ["node", "dist/index.js"]
