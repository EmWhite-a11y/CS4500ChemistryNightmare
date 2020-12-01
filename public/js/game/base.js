const socket = io()

let peers = {}
let localStream = null;

const configuration = {}
const constraints = {
    audio: true,
    video: false
}

let micEnabled = false

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    console.log('Received local stream');
    localVideo.srcObject = stream;
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

    socket.on('signal', (data) => {
        peers[data.id].signal(data.signal)
    })
}

function removePeer(id) {
    if (remoteVideo) {
        let source = remoteVideo.srcObject
        if (source) {
            let tracks = source.getTracks();
            if (tracks) tracks.forEach(track => track.stop())
            remoteVideo.srcObject = null
            remoteVideo.parentNode.remove()
        }
    }

    if (peers[id]) peers[id].destroy()
    delete peers[id]
}

function addPeer(id, initiator) {
    peers[id] = new SimplePeer({
        initiator: initiator,
        stream: localStream,
        config: configuration
    })

    peers[id].on('signal', data => {
        socket.emit('signal', {
            id: id,
            signal: data
        })
    })

    peers[id].on('stream', stream => {
        remoteVideo.srcObject = stream
    })
}

function openPictureMode(e) {
    e.requestPictureInPicture()
}

function toggleMic() {
    micEnabled = !micEnabled;
    for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = micEnabled
    }
    if (micEnabled) $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone");
    else $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone-slash");
    console.log(`Microphone ${micEnabled ? "enabled" : "disabled"}`);
}

$("#mic").on("click", function () {
    toggleMic();
});

function initGame() {
    let game = location.href.match(/([^\/]*)\/*$/)[1]
    let player = $.cookie('player')

    socket.on('game-finished', () => {
        location.href = '/'
    })

    socket.on('leave-game', () => {
        location.href = '/'
    })

    socket.on('game-joined', (role) => {
        $('#spinner').hide()
        console.log(`Player ${player} has role ${role} for game ${game}`)
    })
    
    socket.emit('join-game', game, player)
    $('#spinner').show()
}

$(function () {
    initGame()
})