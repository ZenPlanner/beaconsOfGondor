#!/bin/bash

cd /home/pi/beaconsOfGondor
git fetch
needsUpdate=$(git pull | awk '/Already up-to-date/ {print $0}')
if [[ $needsUpdate != 'Already up-to-date.' ]]
then
   sudo killall node
   echo "Updating"
   sudo node client.js &
fi
