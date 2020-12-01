const socket = io()
let localStream = null;
let peers = {}

const configuration = {}
const constraints = {
    audio: true,
    video: false
}

let micEnabled = true;

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    console.log('Received local stream');
    localStream = stream;
    init()
}).catch(e => alert(`getUserMedia() error: ${e.name}`))

function init() {
    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        addPeer(socket_id, false)

        socket.emit('initSend', socket_id)
    })

    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        removePeer(socket_id)
    })

    socket.on('disconnect', () => {
        console.log('GOT DISCONNECTED')
        for (let socket_id in peers) {
            removePeer(socket_id)
        }
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })
}

function removePeer(socket_id) {
    let videoEl = document.getElementById(socket_id)
    if (videoEl) {

        const tracks = videoEl.srcObject.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        videoEl.srcObject = null
        videoEl.parentNode.remove()
    }
    if (peers[socket_id]) peers[socket_id].destroy()
    delete peers[socket_id]
}

function addPeer(socket_id, am_initiator) {
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        stream: localStream,
        config: configuration
    })

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('stream', stream => {
        let column = document.createElement('div')
        column.classList.add("col-lg-6");
        let newVid = document.createElement('video')
        newVid.srcObject = stream
        newVid.id = socket_id
        newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        newVid.onclick = () => openPictureMode(newVid)
        newVid.ontouchstart = (e) => openPictureMode(newVid)
        newVid.classList.add("gradient-border");
        column.appendChild(newVid)
        videos.appendChild(column)
    })
}

function toggleMute() {
    micEnabled = !micEnabled;
    if (micEnabled) {
        $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone");
    } else {
        $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone-slash");
    }
    console.log(`Microphone ${micEnabled ? "enabled" : "disabled"}`);
}

$("#mic").on("click", function () {
    toggleMute();
});

$(function () {
    let game = location.href.match(/([^\/]*)\/*$/)[1]
    let player = $.cookie('player')
    socket.on('game-joined', role => {
        console.log(`Player ${player} has role ${role} for game ${game}`)
    })
    socket.emit('join-game', game, player)
})