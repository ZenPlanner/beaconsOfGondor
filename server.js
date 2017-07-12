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
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    pattern: 'normal',
    frequency: 0,
    state: 'off'
};

// Converts a 6-8 digit hex string to rgbw colors
function hexToRgb(hex) {
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

        io.sockets.emit('recievedColor', {color:color, pattern:pattern, frequency:frequency});	 
        res.end("received: color:" + color + " pattern:" + pattern + " frequency:"+frequency);
});



app.use(express.static('./public')); //tell the server that ./public/ contains the static webpages


io.sockets.on('connection',function(socket){

        socket.emit('hello',{value:'hello'}); //send the new client its address for auto registry??

        socket.on('sendColor',function(data){
                console.log(data);
                io.sockets.emit('recievedColor',data);
            });


        socket.on('led',function(data){
                console.log(data);
        });

});

server.listen(8080);
console.log('running');



