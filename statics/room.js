var roomId = window.location.href.split('/')[4];
var socket = io('/')
let myVideoStream;
const peers = {};
document.getElementById('play').addEventListener('click', ()=>{
    document.getElementById('play').remove();
    const Watcher = new Peer({host: '/', path: '/peerjs'})

    const myPeer = new Peer({host: '/', path: '/peerjs'})
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
        myVideoStream = stream;
        addVideo(myVideo, myVideoStream);
        myPeer.on('call', call=>{
            call.answer(stream);
            console.log("Old User Called");
            const video = document.createElement('video');
            call.on('stream', uStream=>{
                addVideo(video, uStream);
            })
        })

        socket.on('user-connected', (id)=>{
            connectTo(id, stream);
        })
    });

    socket.on('user-disconnected', (id)=>{
        if(peers[id]) peers[id].close();
    })

    socket.on('host-disconnected', ()=>{
        document.getElementsByClassName('mainScreen')[0].remove();
        $('body').append("<h2 class='text-center' style='margin-top: 2rem'>Host has ended the stream!</h2>");
    })
    
    function connectTo(id, stream){
        const call = myPeer.call(id, stream);
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

    myPeer.on('open', (id)=>{
        socket.emit('join-call', roomId, id);
    })
    
    Watcher.on('open', (id)=>{
        socket.emit('join-room', roomId, id);
    })
    
    Watcher.on('call', function(call) {
        call.answer(null);
        call.on('stream', (stream)=>{
            let video = document.getElementById('VPlayer');
            video.srcObject = stream;
            video.addEventListener('canplay', () => {
                video.play()
            })
        })
    });    
})

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

$('#fullScreen').on('click', ()=>{
    $('.mainScreen')[0].requestFullscreen();
});

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