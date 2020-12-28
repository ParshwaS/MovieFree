const express = require('express')
require('./models')
const mongoose = require('mongoose');
const comp = require('compression');
const bp = require('body-parser');
const app = express()
const server = require('http').Server(app);
const cors = require('cors')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug: true
})
const io = require('socket.io')(server);

app.use(bp.json({limit: '50mb'}));
app.use(comp());
app.use(cors());
app.use('/peerjs', peerServer);

const PORT = process.env.PORT || 80

const streams = {};
const host = {};

io.on('connection', socket => {
    
    socket.on('create-room', (roomId, peerId)=>{
        streams[roomId] = peerId;
        host[roomId] = socket;
        console.log('Room created with peerId of '+peerId);
        console.log("Room's Id: "+roomId);
    })

    socket.on('join-room', (roomId, id)=>{
        socket.emit('roomId', streams[roomId]);
        console.log("Viewer Entered in Room: "+roomId);
        host[roomId].emit('user-connected', id);
    })
})

require('./routes/torrent')(app);
require('./routes/movies')(app);

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.get('/player/:mag', (req, res)=>{
    res.sendFile(__dirname+'/player.html');
});

app.get('/room/:id', (req, res)=>{
    res.sendFile(__dirname+'/room.html');
});

app.get('/newNewFlu', (req, res)=>{
    res.sendFile(__dirname+'/addNew.html');
});

app.get('/newNewglu', (req, res)=>{
    res.sendFile(__dirname+'/addSeries.html');
});

app.use(express.static('./statics'));

server.listen(PORT,()=>{
    console.log("Server started...");
});