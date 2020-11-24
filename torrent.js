const Torrent = require('torrent-search-api')

Torrent.enablePublicProviders();

Torrent.search('Incredibles 2', 'Movies', 50).then((data)=>{
    let final = []
    data.forEach(e => {
        if(e.title.includes("Incredibles")){
            Torrent.getMagnet(e).then((mag)=>{
                final.push({details: e, magnet: mag});
            })
        }
    })
    res.json(final);
})