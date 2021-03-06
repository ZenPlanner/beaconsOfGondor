//client.js
require('dotenv').config();
var io = require('socket.io-client');
var socket = io.connect(process.env.SERVER_URL, {reconnect: true});
var os = require('os');
var interfaces = os.networkInterfaces( );
var hostname = os.hostname();
var Gpio = require('pigpio').Gpio;
var lc = require('./ledController.js');
var ledController = new lc();

// setup the io pins
var pins = [
    new Gpio(23, {mode: Gpio.OUTPUT}), /* Red */
    new Gpio(18, {mode: Gpio.OUTPUT}), /* Green */
    new Gpio(15, {mode: Gpio.OUTPUT}), /* Blue */
    new Gpio(14, {mode: Gpio.OUTPUT})  /* White */
];

function setHardwarePins(current) {
    pins[0].pwmWrite(Math.floor(ledController.current.r));
    pins[1].pwmWrite(Math.floor(ledController.current.g));
    pins[2].pwmWrite(Math.floor(ledController.current.b));
    pins[3].pwmWrite(Math.floor(ledController.current.w));
}

function loop() {
    var program = ledController.getPinSettingsFromProgram();
    //console.log(program);
    setHardwarePins(program);
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
    var logString = "Fader Setting: r:"+ledController.current.fader.r+" g:"+ledController.current.fader.g+
        " b:"+ledController.current.fader.b+" w:"+ledController.current.fader.w+"\r\n"+
        "Current Settings: r:"+ledController.current.r+" g:"+ledController.current.g+
        " b:"+ledController.current.b+" w:"+ledController.current.w+" pattern:"+
        ledController.current.pattern+" frequency:"+ledController.current.frequency+
        " state:"+ledController.current.state
        + " \r\nrRatio: " +ledController.current.fader.rRatio + "\r\n"+
        " \r\ngRatio: " +ledController.current.fader.gRatio + "\r\n"+
        " \r\nbRatio: " +ledController.current.fader.bRatio + "\r\n"+
        " \r\nwRatio: " +ledController.current.fader.wRatio + "\r\n";
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

/*
socket.on('receivedColor', function (data) {
            clearTimeout(currentTimeout);
            var destination = data.destination != null ? data.destination : 'ALL';
            if(destination == 'ALL' || hostname.indexOf(destination) > -1) {
                ledController.setCurrentColors(data.color);
                ledController.current.pattern = data.pattern;
                ledController.current.frequency = data.frequency;
                currentTimeout = setInterval(loop, data.frequency);
            }
}) ;
*/

socket.on('receivedProgram', function (data) {
    clearTimeout(currentTimeout);
    ledController.setProgram(data);
    currentTimeout = setInterval(loop, data.frequency);
});
