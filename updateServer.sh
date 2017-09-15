#!/bin/bash

cd /home/beaconsOfGondor
git fetch
needsUpdate=$(git pull | awk '/Already up-to-date/ {print $0}')
if [[ $needsUpdate != 'Already up-to-date.' ]]
then
   forever stop ./server.js
   echo "Updating"
   forever start -a -l ./server.log -o ./serverOut.log -e serverError.log server.js
fi

