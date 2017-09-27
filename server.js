//https://github.com/fivdi/pigpio#installation
//http://seb.ly/2016/02/fading-leds-with-pwm-on-a-raspberry-pi-zero-with-node-js/
//http://www.instructables.com/id/Easy-NodeJS-WebSockets-LED-Controller-for-Raspberr/
//tostart: node main.js
//http://localhost:8082
//http://localhost:8082/setColor?color=FF0000

//https://github.com/jperkin/node-rpio


//EC2 port forwarding for port 80
//http://www.lauradhamilton.com/how-to-set-up-a-nodejs-web-server-on-amazon-ec2

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var current = {
    color: '00000000',
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    pattern: 'normal',
    frequency: 0,
    state: 'off'
};
var clientIPAddresses = [];

// Converts a 6-8 digit hex string to rgbw colors
function hexToRgb(hex) {
    console.log(hex);
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        w: (result[4] != null) ? parseInt(result[4], 16) : 0
    } : null;
}

app.get('/setColor', function(req, res) {

        var color = req.query.color;
        var pattern = req.query.pattern != null ? req.query.pattern : 'normal';
        var frequency = req.query.frequency != null ? req.query.frequency : 1000;
        var colorMap = hexToRgb(color);
        current.r = colorMap.r;
        current.g = colorMap.g;
        current.b = colorMap.b;
        current.w = colorMap.w;        
        current.pattern = pattern;
        current.frequency = frequency;
        current.color = color;

        io.sockets.emit('receivedColor', {color:color, pattern:pattern, frequency:frequency});
        res.end("received: color:" + color + " pattern:" + pattern + " frequency:"+frequency);
});

app.get('/party', function(req, res) {

        var color = req.query.color;
        var pattern = req.query.pattern != null ? req.query.pattern : 'random';
        var frequency = req.query.frequency != null ? req.query.frequency : 2000;
        var colorMap = hexToRgb(color);
        current.r = colorMap.r;
        current.g = colorMap.g;
        current.b = colorMap.b;
        current.w = colorMap.w;        
        current.pattern = pattern;
        current.frequency = frequency;
        current.color = color;

        io.sockets.emit('receivedColor', {color:color, pattern:pattern, frequency:frequency});
        res.end("received: color:" + color + " pattern:" + pattern + " frequency:"+frequency);
});

function setColor(data) {
    var color = data.color;
    var pattern = data.pattern != null ? data.pattern : 'random';
    var frequency = data.frequency != null ? data.frequency : 2000;
    var colorMap = hexToRgb(color);
    current.r = colorMap.r;
    current.g = colorMap.g;
    current.b = colorMap.b;
    current.w = colorMap.w;
    current.pattern = pattern;
    current.frequency = frequency;
    current.color = color;
}

app.use(express.static('./public')); //tell the server that ./public/ contains the static webpages


io.sockets.on('connection',function(socket){
        socket.emit('receivedColor', {color:current.color, pattern:current.pattern, frequency:current.frequency});

	socket.on('logIP', function(data) {
            var found = false;
            for(var i=0;i<clientIPAddresses.length;i++){
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
            console.log(data);
            setColor(data);
            console.log(current);
            io.sockets.emit('receivedColor',{color:current.color, pattern:current.pattern, frequency:current.frequency});
        });
		
        socket.on('led',function(data){
            console.log(data);
        });
		
	socket.on('showIPs',function(data){
	    console.log(data);
            io.sockets.emit('receivedIPs',{addresses:clientIPAddresses});
        });

});

server.listen(8080);
console.log('running');



