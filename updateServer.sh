#!/bin/bash

cd /home/beaconsOfGondor
git fetch
needsUpdate=$(git pull | awk '/Already up-to-date/ {print $0}')
if [[ $needsUpdate != 'Already up-to-date.' ]]
then
   sudo killall node
   echo "Updating"
   nohup node server.js &
fi