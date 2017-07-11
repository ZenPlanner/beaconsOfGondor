//client.js
var io = require('socket.io-client');
var socket = io.connect('http://ec2-54-172-251-229.compute-1.amazonaws.com', {reconnect: true});

var Gpio = require('pigpio').Gpio;


var pinRed = new Gpio(23, {mode: Gpio.OUTPUT});
var pinGreen = new Gpio(18, {mode: Gpio.OUTPUT});
var pinBlue = new Gpio(15, {mode: Gpio.OUTPUT});
var pinWhite = new Gpio(14, {mode: Gpio.OUTPUT});

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

setColor("000000");


// Add a connect listener
socket.on('connect', function (socket) {
    console.log('Connected!');
});


socket.on('recievedColor', function (data) {
            console.log('recievedColor' + data);
            setColor(data.value);
}) ;