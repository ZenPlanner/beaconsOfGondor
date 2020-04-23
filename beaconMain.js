//https://github.com/fivdi/pigpio#installation
//http://seb.ly/2016/02/fading-leds-with-pwm-on-a-raspberry-pi-zero-with-node-js/
//http://www.instructables.com/id/Easy-NodeJS-WebSockets-LED-Controller-for-Raspberr/
//tostart: node main.js
//http://localhost:8082
//http://localhost:8082/setColor?color=FF0000

//https://github.com/jperkin/node-rpio


//EC2 port forwarding for port 80
//http://www.lauradhamilton.com/how-to-set-up-a-nodejs-web-server-on-amazon-ec2

let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let lc = require('./ledController.js');

let programState = {
    frequency: 1000,
    lightPattern: "solid",
    colorPattern: "list",
    colors: [
        "00FF0000"
    ],
    destination: "all"
};

let clientIPAddresses = [];

app.get('/setColor', function(req, res) {
    setColor(req.query);
    io.sockets.emit('receivedProgram', programState);
    res.end("received: " + JSON.stringify(req.query));
});

function setColor(data) {
    programState.colors = [lc.hexStringToInt(data.color)];
    programState.colorPattern = "list";
    programState.frequency = data.frequency != null ? data.frequency : 2000;
    programState.destination = data.destination != null ? data.destination : "all";
    if (data.pattern === "strobe" || data.pattern === "fade") {
        programState.lightPattern = data.pattern;
    } else {
        programState.lightPattern = "solid";
    }
}

function setProgramState(data) {
    console.log(JSON.stringify(data));
    programState.frequency = data.frequency;
    programState.lightPattern = data.lightPattern;
    programState.colorPattern = data.colorPattern;
    programState.colors = data.colors;
}

app.use(express.static('./public')); //tell the server that ./public/ contains the static webpages


io.sockets.on('connection',function(socket){
    socket.emit('receivedProgram', programState);

	socket.on('logIP', function(data) {
            let found = false;
            for(let i=0;i<clientIPAddresses.length;i++){
                if(clientIPAddresses[i] === data.value){
                    found = true;
                    break;
                }
            }
            if(!found){
                clientIPAddresses.push(data.value);
            }
	});
		
    socket.on('sendColor',function(data){
        setColor(data);
        io.sockets.emit('receivedProgram',programState);
    });

    socket.on('sendProgram',function(data){
        setProgramState(data);
        io.sockets.emit('receivedProgram',programState);
    });
		
	socket.on('showIPs',function(data){
	    console.log(data);
        io.sockets.emit('receivedIPs',{addresses:clientIPAddresses});
    });
});

server.listen(8082);
console.log('running');



