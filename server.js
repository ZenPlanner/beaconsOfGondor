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

app.get('/setColor', function(req, res) {

        var color = req.query.color;
        console.log(color);
        io.sockets.emit('recievedColor',{value:color});
	 
        res.end("I have received the ID: " + color);
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



