#!/bin/bash

cd /home/pi/beaconsOfGondor
git fetch
BEHIND=$(git rev-list --count origin/master ^HEAD)
if [[ "$BEHIND" != "0" ]]
then
    git pull
    sudo killall node
    echo "Updating"
    sudo node client.js &
fi
