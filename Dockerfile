FROM node:20.13.1

# createClient the log directory
RUN mkdir -p /var/log/application/pedxopay

# Set the working directory
WORKDIR /usr/src/app


# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install -g @nestjs/cli
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Map a volume for the log files and add a volume to override the code
VOLUME ["/src", "/var/log/application/pedxopay"]

# Build the NestJS application
RUN npm run build

CMD [ "npm","run", "start:dev" ]
