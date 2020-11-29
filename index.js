const express = require('express')
require('./models')
const mongoose = require('mongoose');
const Movie = mongoose.model('movie');
const comp = require('compression');
const bp = require('body-parser');
const app = express()
const cors = require('cors')

app.use(bp.json({limit: '50mb'}));
app.use(comp());
app.use(cors());

const PORT = process.env.PORT || 3000

require('./routes/torrent')(app);
require('./routes/movies')(app);

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.get('/player/:mag', (req, res)=>{
    res.sendFile(__dirname+'/player.html');
});

app.get('/newNewFlu', (req, res)=>{
    res.sendFile(__dirname+'/addNew.html');
});

app.listen(PORT,()=>{
    console.log("Server started...");
});