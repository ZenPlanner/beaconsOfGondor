//examples calls
///setColor?color=000000&pattern=normal

//client.js
var io = require('socket.io-client');
var socket = io.connect('http://ec2-54-172-251-229.compute-1.amazonaws.com', {reconnect: true});
var os = require('os');
var interfaces = os.networkInterfaces( );
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
		w:0,
        rRatio: 1,
        gRatio: 1,
        bRatio: 1,
        wRatio: 1
	},
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    pattern: 'normal',
    frequency: 100,
    state: 'on'
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
    if (r < 0) r = 0;
    if (g < 0) g = 0;
    if (b < 0) b = 0;
    if (w < 0) w = 0;
    pins[0].pwmWrite(Math.floor(r));
    pins[1].pwmWrite(Math.floor(g));
    pins[2].pwmWrite(Math.floor(b));
    pins[3].pwmWrite(Math.floor(w));   
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
    current.fader.rRatio = colorMap.r / 255;
    current.fader.gRatio = colorMap.g / 255;
    current.fader.bRatio = colorMap.b / 255;
    current.fader.wRatio = colorMap.w / 255;
}

function fadeIn() {
	if (current.r < current.fader.r)
		current.r = current.r + (current.fader.rRatio);
	if (current.g < current.fader.g)
		current.g = current.g + (current.fader.gRatio);
	if (current.b < current.fader.b)
		current.b = current.b + (current.fader.bRatio);
	if (current.w < current.fader.w)
		current.w = current.w + (current.fader.wRatio);
	setColorPins(current.r, current.g, current.b, current.w);
	if (current.r >= current.fader.r &&
		current.g >= current.fader.g &&
		current.b >= current.fader.b &&
		current.w >= current.fader.w) {
	   current.state = 'off'; // start fading out
    }
}

function fadeOut() {
	if (current.r > 0)
		current.r = current.r - (current.fader.rRatio);
	if (current.g > 0)
		current.g = current.g - (current.fader.gRatio);
	if (current.b > 0)
		current.b = current.b - (current.fader.bRatio);
	if (current.w > 0)
		current.w = current.w - (current.fader.wRatio);
	setColorPins(current.r, current.g, current.b, current.w);
	if (current.r <= 0 && current.g <= 0 &&
            current.b <= 0 && current.w <= 0) 
		current.state = 'on'; // start fading in
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
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
    } else if (current.pattern === 'random') {

        if (current.state === 'on') {
            setColorPins(0, 0, 0, 0);
            current.state = 'off';
        } else {
            setColorPins(getRandomInt(0, current.r), getRandomInt(0, current.g), getRandomInt(0, current.b), getRandomInt(0, current.w));
            current.state = 'on';
        }
		
	}
}

function getLocalIpAddresses() {
   var addresses = [];
   for (var k in interfaces) {
       for (var k2 in interfaces[k]) {
           var address = interfaces[k][k2];
           if (address.family === 'IPv4' && !address.internal) {
               addresses.push(address.address);
           }
       }
   }
   return addresses;
}

function printState() {
    var logString = "Fader Setting: r:"+current.fader.r+" g:"+current.fader.g+
                    " b:"+current.fader.b+" w:"+current.fader.w+"\r\n"+
                    "Current Settings: r:"+current.r+" g:"+current.g+
                    " b:"+current.b+" w:"+current.w+" pattern:"+
                    current.pattern+" frequency:"+current.frequency+
                    " state:"+current.state
		    + " \r\nrRatio: " +current.fader.rRatio + "\r\n"+
		     " \r\ngRatio: " +current.fader.gRatio + "\r\n"+
		     " \r\nbRatio: " +current.fader.bRatio + "\r\n"+
		     " \r\nwRatio: " +current.fader.wRatio + "\r\n";
    console.log(logString);
}

// start the running loop
var currentTimeout = setInterval(loop, 1000);

// Add a connect listener and log IP addresses on connect
var myIPs = getLocalIpAddresses();
socket.on('connect', function (data) {
	for (var i in myIPs) {
		socket.emit('logIP',{value:myIPs[i]});
	}
});

socket.on('recievedColor', function (data) {
            clearTimeout(currentTimeout);
			setCurrentColors(data.color);
            current.pattern = data.pattern;
            current.frequency = data.frequency;
            currentTimeout = setInterval(loop, data.frequency);
}) ;
