var roomId = window.location.href.split('/')[4];
var socket = io('/')
const myPeer = new Peer()

myPeer.on('open', (id)=>{
    socket.emit('join-room', roomId, id);
})

myPeer.on('call', function(call) {
    call.answer(null);
    call.on('stream', (stream)=>{
        let video = document.getElementById('stream');
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
    })
});