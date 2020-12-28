var roomId = window.location.href.split('/')[4];
var socket = io('/')
const myPeer = new Peer()
myPeer.on('open', (id)=>{
    socket.emit('join-room', roomId);
    socket.on('roomId', (peerId)=>{
        let ss = new MediaStream();
        console.log('Called the Peer with Id '+peerId);
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        getUserMedia({video: true, audio: true}, function(stream) {
        var call = myPeer.call(peerId, stream);
        call.on('stream', function(stream) {
            console.log('Stream', stream);
            let video = document.getElementById('stream');
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play()
            })
        });
        }, function(err) {
        console.log('Failed to get local stream' ,err);
        });
    })
})