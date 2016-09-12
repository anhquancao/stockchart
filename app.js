var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);



var routes = require('./routes/index');

var app = express();

var port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', function (socket) {
    socket.emit('stockchart', {hello: 'connected'});

});
app.use('/api', routes(io));

app.use(function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


