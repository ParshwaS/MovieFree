const express = require('express')
const fetch = require('node-fetch');
const app = express()
const JsSoup = require('jssoup').default
const WebTorrent = require('webtorrent')
const Torrent = require('torrent-search-api')

Torrent.enablePublicProviders();

let client = new WebTorrent()

const PORT = process.env.PORT || 3000

torrents = Object();

app.get('/addMag/:mag', async (req, res)=>{
    let t = torrents[req.params.mag];
    if(!t){
        torrents[req.params.mag] = 'Requested';
        let isThere = await client.get(req.params.mag);
        if(!isThere){
            client.add(req.params.mag, (torrent)=>{
                console.log("Torrent Hash for "+req.params.mag+" is "+torrent.infoHash);
                index = -1;
                torrent.files.forEach((e, i)=>{
                    if(e.name.includes(".mp4")||e.name.includes(".mkv")){
                        index = i;
                    }
                })
                torrents[req.params.mag] = index;
                res.json(torrent.infoHash)
            });
        }
    }else{
        res.json("Is There!!")
    }
})

function xyz(e){
    return Torrent.getMagnet(e).then((mag)=>{
        var fmag = mag.split(":")[3].split("&")[0];
        return {details: e, hash: fmag};
    })
}

app.get('/search/:query', (req,res)=>{
    Torrent.search(req.params.query, 'Movies', 15).then((data)=>{
        let Promises = []
        data.forEach(e => {
            let words = req.params.query.split(" ");
            var check = false;
            words.forEach((word)=>{
                if(e.title&&e.title.includes(word)){
                    check = true;
                }
            });
            if(check){
                Promises.push(xyz(e));
            }
        });
        Promise.all(Promises).then((responses)=>{
            let final = []
            responses.forEach((resp)=>{
                final.push(resp);
            })
            res.json(final);
        }).catch((err)=>{
            console.log(err);
        })
    })
})

app.get('/video/:mag', async (req, res)=>{
    var tor = client.get(req.params.mag)
    if(tor&&torrents[req.params.mag]>-1){
        let file = tor.files[torrents[req.params.mag]];
        let range = req.headers.range;
        let positions = range.replace(/bytes=/, "").split("-");
        let start = parseInt(positions[0], 10)
        let file_size = file.length
        let end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;
        let chunksize = (end - start) + 1;
        let head = {
            'Content-Range': "bytes " + start + "-" + end +"/" + file_size,
            'Accept-Range': "bytes",
            'Content-Length': chunksize,
            'Content-Type': "video/mp4"
        }
        res.writeHead(206, head)
        let stream_pos = {
            start: start,
            end: end
        }
        let stream = file.createReadStream(stream_pos);
        stream.pipe(res);
    }else{
        res.json({error: "File not found!", tor: tor})
    }
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.listen(PORT,()=>{
    console.log("Server started...");
});