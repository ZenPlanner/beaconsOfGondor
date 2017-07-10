//https://github.com/fivdi/pigpio#installation
//http://seb.ly/2016/02/fading-leds-with-pwm-on-a-raspberry-pi-zero-with-node-js/
//http://www.instructables.com/id/Easy-NodeJS-WebSockets-LED-Controller-for-Raspberr/
//tostart: node main.js
//http://localhost:8082
//http://localhost:8082/setColor?color=FF0000

//https://github.com/jperkin/node-rpio

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var Gpio = require('pigpio').Gpio;

var pinRed = new Gpio(23, {mode: Gpio.OUTPUT});
var pinGreen = new Gpio(18, {mode: Gpio.OUTPUT});
var pinBlue = new Gpio(15, {mode: Gpio.OUTPUT});
var pinWhite = new Gpio(14, {mode: Gpio.OUTPUT});

app.get('/setColor', function(req, res) {

        var color = req.query.color;
        console.log(color);
        io.sockets.emit('recievedColor',{value:color});
        res.end("I have received the ID: " + color);
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function setColorPins(r, g, b, w) {
	pinRed.pwmWrite(r);
	pinGreen.pwmWrite(g);
	pinBlue.pwmWrite(b);
	pinWhite.pwmWrite(w);	
}

function setColor(hexColor) {
	colorMap = hexToRgb(hexColor);
	if (colorMap != null) {
		if (colorMap.r == 255 && colorMap.g == 255 && colorMap.b == 255)
			setColorPins(0,0,0,255);
		else
			setColorPins(colorMap.r, colorMap.g, colorMap.b, 0);
	}
}

app.use(express.static('/home/pi/beaconsOfGondor/public')); //tell the server that ./public/ contains the static webpages

setColor("000000");

io.sockets.on('connection',function(socket){

        socket.emit('hello',{value:'hello'}); //send the new client its address for auto registry??

        socket.on('sendColor',function(data){
                console.log(data);
                io.sockets.emit('recievedColor',data);
                setColor(data.value);
                /* if (eval(data).value == 'ff0000') {
                        pinRed.pwmWrite(255);
                        pinGreen.pwmWrite(0);
                        pinBlue.pwmWrite(0);
                        pinWhite.pwmWrite(0);
                } else if (eval(data).value == '00ff00') {
                        pinRed.pwmWrite(0);
                        pinGreen.pwmWrite(255);
                        pinBlue.pwmWrite(0);
                        pinWhite.pwmWrite(0);
                } else if (eval(data).value == '0000ff') {
                        pinRed.pwmWrite(0);
                        pinGreen.pwmWrite(0);
                        pinBlue.pwmWrite(255);
                        pinWhite.pwmWrite(0);
                } else if (eval(data).value == 'ffffff') {
                        pinRed.pwmWrite(0);
                        pinGreen.pwmWrite(0);
                        pinBlue.pwmWrite(0);
                        pinWhite.pwmWrite(255);
                } else if (eval(data).value == '000000') {
                        pinRed.pwmWrite(0);
                        pinGreen.pwmWrite(0);
                        pinBlue.pwmWrite(0);
                        pinWhite.pwmWrite(0);
                } */
            });


        socket.on('led',function(data){
                console.log(data);
        });

});

server.listen(8082);
console.log('running');



