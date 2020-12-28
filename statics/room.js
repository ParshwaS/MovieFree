var roomId = window.location.href.split('/')[4];
var socket = io('/')

document.getElementById('play').addEventListener('click', ()=>{
    document.getElementById('play').remove();
    const myPeer = new Peer(undefined, {
        host: '/',
        path: '/peerjs',
        port: '80'
    })
    
    myPeer.on('open', (id)=>{
        socket.emit('join-room', roomId, id);
    })
    
    myPeer.on('call', function(call) {
        call.answer(null);
        call.on('stream', (stream)=>{
            let video = document.getElementById('stream');
            video.srcObject = stream;
            video.addEventListener('canplay', () => {
                video.play()
            })
        })
    });    
})