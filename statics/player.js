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
const Streamer = new Peer()
const myPeer = new Peer()
const peers = {};
let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
var getUserMedia = navigator.mediaDevices.getUserMedia
if(!getUserMedia)
    getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
getUserMedia({video: true, audio: true}).then(stream => {
    myVideoStream = stream;
    addVideo(myVideo, myVideoStream);
    myPeer.on('call', call=>{
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', uStream=>{
            addVideo(video, uStream);
        })
    })

    socket.on('user-connected', (id)=>{
        connectTo(id, stream);
    })
})

socket.on('user-disconnected', (id)=>{
    if(peers[id]) peers[id].close();
})

function connectTo(id, stream){
    const call = myPeer.call(id, stream);
    console.log("New User Entered Call");
    const video = document.createElement('video');
    call.on('stream', (uStream)=>{
        addVideo(video, uStream);
    })
    call.on('close', ()=>{
        video.remove();
    })

    peers[id] = call;
}

let videoGrid = document.getElementById('videoCall');
function addVideo(video, stream){
    console.log("Added");
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

var controls = new Vue({
    el: '#controls',
    data: {
        mute: 'Mute',
        video: 'Turn Off'
    }
})

$('#mute').on('click', ()=>{
    let en = myVideoStream.getAudioTracks()[0].enabled;
    if(en){
        myVideoStream.getAudioTracks()[0].enabled = false;
        controls.mute = 'UnMute';
    }else{
        myVideoStream.getAudioTracks()[0].enabled = true;
        controls.mute = 'Mute';
    }
})

$('#turnV').on('click', ()=>{
    let en = myVideoStream.getVideoTracks()[0].enabled;
    if(en){
        myVideoStream.getVideoTracks()[0].enabled = false;
        controls.video = 'Turn On';
    }else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        controls.video = 'Turn Off';
    }
})

let roomId = Math.floor(Math.random()*1000000);
Streamer.on('open', (id)=>{
    socket.emit('create-room', roomId, id);
})

$('#fullScreen').on('click', ()=>{
    $('.mainScreen')[0].requestFullscreen();
});

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
    socket.on('watcher-connected', id=>{
        console.log(id);
        const call = Streamer.call(id, stream);
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