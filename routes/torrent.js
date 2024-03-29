const ts = require('torrent-stream')
const Torrent = require('torrent-search-api')
const rm = require('rimraf')

Torrent.enablePublicProviders();

torrents = Object();
tors = Object();

module.exports = function(app){
    app.get('/addMag/:mag', async (req, res)=>{
        let t = torrents[req.params.mag];
        if(!t){
            torrents[req.params.mag] = 'Requested';
            tors[req.params.mag] = ts(req.params.mag, {tmp: 'tmp'})
            tors[req.params.mag].on('ready', ()=>{
                var index = -1;
                var names = []
                tors[req.params.mag].files.forEach((e, i)=>{
                    if(e.name.includes(".mp4")||e.name.includes(".mkv")||e.name.includes(".avi")){
                        index = i;
                    }
                    names.push(e.name)
                })
                torrents[req.params.mag] = index;
                res.json(names);
            })
            tors[req.params.mag].on('error', ()=>{
                delete tors[req.params.mag];
                delete torrents[req.params.mag];
                res.json("ERROR")
            })
        }else{
            res.json("Is There!!")
        }
    })

    app.post('/addMag', async (req, res)=>{
        let t = torrents[req.body.mag];
        if(!t){
            torrents[req.body.mag] = 'Requested';
            tors[req.body.mag] = ts(req.body.mag, {tmp: 'tmp'})
            tors[req.body.mag].on('ready', ()=>{
                var index = -1;
                var names = []
                tors[req.body.mag].files.forEach((e, i)=>{
                    if(e.name.includes(".mp4")||e.name.includes(".mkv")||e.name.includes(".avi")){
                        index = i;
                    }
                    names.push(e.name)
                })
                torrents[req.body.mag] = index;
                res.json({files: names, index: index});
            })
            tors[req.body.mag].on('error', ()=>{
                delete tors[req.body.mag];
                delete torrents[req.body.mag];
                res.json("ERROR")
            })
        }else{
            res.json("Is There!!")
        }
    })

    app.get('/remAll', (req, res)=>{
        rm.sync('./tmp');
        res.json('Done');
    })
    
    function xyz(e){
        return Torrent.getMagnet(e).then((mag)=>{
            var fmag = mag.split(":")[3].split("&")[0];
            return {details: e, hash: fmag};
        })
    }

    app.get('/files/:mag', (req, res)=>{
        res.json(tors[req.params.mag].files)
    });
    
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
        var tor = tors[req.params.mag];
        if(tor&&torrents[req.params.mag]>-1){
            let file = tor.files[torrents[req.params.mag]];
            let range = req.headers.range;
            let positions = range.replace(/bytes=/, "").split("-");
            console.log(positions);
            let start = parseInt(positions[0], 10)
            let file_size = file.length
            let end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;
            let chunksize = (end - start) + 1;
            let head = {
                'Content-Range': "bytes " + start + "-" + end +"/" + file_size,
                'Accept-Range': "bytes",
                'Content-Length': chunksize,
                'Content-Type': "video/mkv"
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
}