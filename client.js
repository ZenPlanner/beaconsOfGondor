//examples calls
///setColor?color=000000&pattern=normal

//client.js
var io = require('socket.io-client');
var socket = io.connect('http://ec2-54-172-251-229.compute-1.amazonaws.com', {reconnect: true});
var Gpio = require('pigpio').Gpio;
// setup the io pins
var pins = [
        new Gpio(23, {mode: Gpio.OUTPUT}), /* Red */
        new Gpio(18, {mode: Gpio.OUTPUT}), /* Green */
        new Gpio(15, {mode: Gpio.OUTPUT}), /* Blue */
        new Gpio(14, {mode: Gpio.OUTPUT})  /* White */
    ];

//set some globals
var current = {
	fader: {
		r:0,
		g:0,
		b:0,
		w:0
	},
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    pattern: 'normal',
    frequency: 100,
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

//Set the pwm hardware pins to the color values
function setColorPins(r, g, b, w) {    
    pins[0].pwmWrite(r);
    pins[1].pwmWrite(g);
    pins[2].pwmWrite(b);
    pins[3].pwmWrite(w);   
}

// pattern: normal, strobe, fade, stripe
function setColor(hexColor) {
    var colorMap = hexToRgb(hexColor);
    if (colorMap != null) {
        setColorPins(colorMap.r, colorMap.g, colorMap.b, colorMap.w);
    }
}

// set the colors on a new call
function setCurrentColors(hexColor) {
	var colorMap = hexToRgb(hexColor);
    current.r = colorMap.r;
    current.g = colorMap.g;
    current.b = colorMap.b;
    current.w = colorMap.w;
	current.fader.r = colorMap.r;
    current.fader.g = colorMap.g;
    current.fader.b = colorMap.b;
    current.fader.w = colorMap.w;
}

function fadeIn() {
	if (current.r < current.fader.r)
		current.r = current.r++;
	if (current.g < current.fader.g)
		current.g = current.g++;
	if (current.b < current.fader.b)
		current.b = current.b++;
	if (current.w < current.fader.w)
		current.w = current.w++;
	setColorPins(current.r, current.g, current.b, current.w);
	if (current.r == current.fader.r &&
		current.g == current.fader.g &&
		current.b == current.fader.b &&
		current.w == current.fader.w
	} current.state = 'off'; // start fading out
}

function fadeOut() {
	if (current.r > 0)
		current.r = current.r--;
	if (current.g > 0)
		current.g = current.g--;
	if (current.b > 0)
		current.b = current.b--;
	if (current.w > 0)
		current.w = current.w--;
	setColorPins(current.r, current.g, current.b, current.w);
	if (current.r === current.g === current.b === current.w === 0) 
		current.state = 'on'; // start fading in
}

function loop() {
    if (current.pattern === 'normal') {
        setColorPins(current.r, current.g, current.b, current.w);
    } else if (current.pattern === 'strobe') {
        if (current.state === 'on') {
            setColorPins(0, 0, 0, 0);
            current.state = 'off';
        } else {
            setColorPins(current.r, current.g, current.b, current.w);
            current.state = 'on';
        }
    } else if (current.pattern === 'fade') {
		if (current.state === 'on') {
			fadeIn();
		} else {
			fadeOut();
		}
    }
}

// start the running loop
var currentTimeout = setInterval(loop, 1000);

// Add a connect listener
socket.on('connect', function (socket) {
    console.log('Connected!');
});

socket.on('recievedColor', function (data) {
            console.log('recievedColor' + data);
            clearTimeout(currentTimeout);
			setCurrentColors(data.color);
            current.pattern = data.pattern;
            current.frequency = data.frequency;
            currentTimeout = setInterval(loop, data.frequency);
}) ;
