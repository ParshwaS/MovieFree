const torrent = require('torrent-stream')

var engine = torrent('0BA66BFA81F29F96D58D4C896FC30DFF9F24F784')

engine.on('ready', ()=>{
    engine.files.forEach((file)=>{
        console.log("Filename: ", file.name);
    })
    engine.destroy();
})