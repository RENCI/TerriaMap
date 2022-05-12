# Docker image for the primary terria map application server
FROM node:14.18.2

# declare ownership
LABEL maintainer="RENCI"

# install os updates and GDAL
RUN apt-get update && apt-get install -y gdal-bin

# install an editor
RUN apt-get install -yq vim

# create the non-root user
#RUN useradd -m -d /home/nru -u 1000 nru

# create some needed dirs for the content
# this was in the original dockerfile so i kept it.
RUN mkdir -p /home/nru/usr/src/app

# change to the base directory
WORKDIR /home/nru/usr/src/app

# copy in all app files
COPY . /home/nru/usr/src/app

# make sure everything is readable
RUN chmod 777 -R /home/nru

# need this for large web sites
RUN export NODE_OPTIONS=--max_old_space_size=4096

# set a couple directives so the package update works
RUN yarn config set user 0
RUN yarn config set unsafe-perm true

# get a specific version of yarn
RUN yarn policies set-version 1.22.17

# change to that user
USER 1000

# install yarn and build up the node_modules dir
RUN yarn install

# create the "build" dir/files
RUN npm run gulp build

# remove the file we will turn into a symbolic link
RUN rm /home/nru/usr/src/app/wwwroot/init/apsviz.json

# make a symbolic link to the apsviz.json file
RUN ln -s /fileserver/terria-map/apsviz.json /home/nru/usr/src/app/wwwroot/init/apsviz.json

# expose the web server port
EXPOSE 3001

# start the app
CMD [ "node", "./node_modules/terriajs-server/lib/app.js"]
