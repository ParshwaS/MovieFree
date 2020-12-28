var socket = io('/')
var delay = 0.0;
function addOffset(videoId, offset) {
    const video = document.getElementById(videoId);
    if (video) {
        Array.from(video.textTracks).forEach((track) => {
            if (track.mode === 'showing') {
                delay += offset || 0.5;
                Array.from(track.cues).forEach((cue) => {
                    cue.startTime += offset || 0.5;
                    cue.endTime += offset || 0.5;
                });
                $('#sub_delay').val(delay);
                return true;
            }
        });
    }
    return false;
}
function removeOffset(videoId, offset) {
    const video = document.getElementById(videoId);
    if (video) {
        Array.from(video.textTracks).forEach((track) => {
            if (track.mode === 'showing') {
                delay -= offset || 0.5;
                Array.from(track.cues).forEach((cue) => {
                    cue.startTime -= offset || 0.5;
                    cue.endTime -= offset || 0.5;
                });
                $('#sub_delay').val(delay);
                return true;
            }
        });
    }
    return false;
}
function addDelay() {
    addOffset('VPlayer', 0.5);
}
function remDelay() {
    removeOffset('VPlayer', 0.5);
}
$('#sub_delay').on('change', () => {
    addOffset('VPlayer', parseFloat($('#sub_delay').val()) - delay);
});
var id;
const myPeer = new Peer(undefined, {
    host: '/',
    path: '/peerjs',
    port: '80'
})
const peers = {}
let roomId = Math.floor(Math.random()*1000000);
myPeer.on('open', (id)=>{
    socket.emit('create-room', roomId, id);
})
$('#share').on('click', ()=>{
    let VPlayer = document.getElementById('VPlayer');
    let stream;
    const fps=0;
    if(VPlayer.captureStream){
        stream = VPlayer.captureStream(fps);
    }else if(VPlayer.mozCaptureStream){
        stream = VPlayer.mozCaptureStream(fps);
    }else{
        console.log("Cannot Capture");
        stream = null;
    }
    $('#room').append('RoomId = '+roomId);
    socket.on('user-connected', id=>{
        console.log("User Connected Streaming User The Movie");
        const call = myPeer.call(id, stream);
        peers[id] = call;
    })
});

$(document).ready(() => {
    id = window.location.href.split('/')[4];
    $.get('/movies/get/' + id, (data) => {
        $.get('/addMag/' + data.hashes[0].hash, (resp) => {
            if (resp == "ERROR") {
                alert("Something Went Wrong!!");
            } else {
                $('#VPlayer').attr('src', '/video/' + data.hashes[0].hash);
            }
        });
        $('#title').html(data.details.title);
        $('#subs').attr('src', data.details.subtitle);
    })
});