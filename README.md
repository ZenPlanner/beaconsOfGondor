# Beacon Project

to run locally:

install dependencies:

`npm install`

to run:

`npm start server.js` 

Installed forever (npm install forever -g)

Schedule Auto-update of git repo:
	Add new crontab like below.  This will run the update.sh script every 5 minutes.
		> crontab -e
		*/5 * * * * sudo /home/pi/beaconsOfGondor/update.sh
	To see if the cron job ran:
		grep CRON /var/log/syslog

sudo npm install dotenv