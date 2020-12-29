const express = require('express')
require('./models')
const mongoose = require('mongoose');
const comp = require('compression');
const bp = require('body-parser');
const app = express()
const fs = require('fs')
var privateKey  = fs.readFileSync('host.key', 'utf8');
var certificate = fs.readFileSync('host.cer', 'utf8');
var credentials = {key: privateKey, cert: certificate};
const server = require('https').createServer(credentials, app);
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

const streams = {};
const host = {};
const rooms = {};

io.on('connection', socket => {
    
    socket.on('create-room', (roomId, peerId)=>{
        streams[roomId] = peerId;
        host[roomId] = socket;
        rooms[roomId] = [socket];
        console.log('Room created with peerId of '+peerId);
        console.log("Room's Id: "+roomId);
        socket.on('disconnect', ()=>{
            rooms[roomId].forEach(peer => {
                peer.emit('host-disconnected');
                delete rooms[roomId];
                delete host[roomId];
                delete streams[roomId];
            })
        })
    })

    socket.on('join-room', (roomId, id)=>{
        socket.emit('roomId', streams[roomId]);
        console.log("Viewer Entered in Room: "+roomId);
        host[roomId].emit('watcher-connected', id);
    })

    socket.on('join-call', (roomId, id)=>{
        rooms[roomId].forEach(peer => {
            peer.emit('user-connected', id);
        });

        rooms[roomId].push(socket);

        socket.on('disconnect', ()=>{
            rooms[roomId].forEach(peer => {
                peer.emit('user-disconnected', id);
            });
        })
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

// var httpsServer = https.createServer(credentials, app);

server.listen(443,()=>{
    console.log("Server started...");
});

// httpsServer.listen(443, ()=>{
//     console.log("Secured Server Started...");
// })