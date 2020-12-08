const socket = io()

const game = location.href.match(/([^\/]*)\/*$/)[1]
let state = null

let peers = {}
let localStream = null
let micEnabled = false

//navigator.mediaDevices.getUserMedia({
//    audio: true,
//    video: false
//}).then((stream) => {
//    return
//    log('Received local stream')
//    localVideo.srcObject = stream
//    localStream = stream
//    log('Local stream ready')
//    initSignals()
//}).catch((error) => alert(`getUserMedia() error: ${error.name}`))

function initSignals() {
    socket.on('vc-init-receive', (id) => {
        log(`Received vc-init-receive from ${id}`)

        addPeer(id, false)

        socket.emit('vc-init-send', id)
        log(`Sent vc-init-send to ${id}`)
    })

    socket.on('vc-init-send', (id) => {
        log(`Received vc-init-send from ${id}`)

        addPeer(id, true)
    })

    socket.on('vc-remove', (id) => {
        removePeer(id)
    })

    socket.on('disconnect', () => {
        log(`Peer disconnected`)
        
        for (let id in peers) {
            removePeer(id)
        }
    })

    socket.on('vc-signal', (data) => {
        peers[data.id].signal(data.signal)
    })

    log('Signals initialized')
}

function removePeer(id) {
    log(`Removing peer ${id}`)

    let source = remoteVideo.srcObject
    if (source) {
        let tracks = source.getTracks()
        if (tracks) tracks.forEach(track => track.stop())
        remoteVideo.srcObject = null
    }

    if (peers[id]) peers[id].destroy()
    delete peers[id]
}

function addPeer(id, initiator) {
    peers[id] = new SimplePeer({
        initiator,
        stream: localStream
    })

    peers[id].on('connect', () => {
        log(`${id} (${initiator}) connected`)
    })

    peers[id].on('signal', (data) => {
        log(`${id} (${initiator}) signaled`)

        socket.emit('vc-signal', {
            id,
            signal: data
        })
    })

    peers[id].on('stream', (stream) => {
        log(`${id} (${initiator}) streamed`)

        remoteVideo.srcObject = stream
        remoteVideo.playsinline = false
    })

    log(`Peer ${id} added`)
}

function openPictureMode(e) {
    e.requestPictureInPicture()
}

function toggleMic() {
    micEnabled = !micEnabled
    if (localStream) {
        let audioTracks = localStream.getAudioTracks()
        if (audioTracks) {
            for (let index in audioTracks) {
                let audioTrack = audioTracks[index]
                if (audioTrack) audioTrack.enabled = micEnabled
            }
        }
    }
    if (micEnabled) $('#mic .fas').removeClass('fa-microphone fa-microphone-slash').addClass('fa-microphone')
    else $('#mic .fas').removeClass('fa-microphone fa-microphone-slash').addClass('fa-microphone-slash')
    log(`Microphone ${micEnabled ? 'enabled' : 'disabled'}`)
}

$('#mic').on('click', function () {
    toggleMic()
})

function initGame() {
    socket.on('game-finished', (status) => {
        $('#gameOverModal').modal('show')
    })

    socket.on('leave-game', () => {
        location.href = '/'
    })

    socket.on('game-joined', (role) => {
        $('#spinner').hide()
        log(`Player ${player} has role ${role} for game ${game}`)
        if (role === 2) {
            setTimeout(function() {
                socket.emit('vc-init')
                log('Sent vc-init')
            }, 5000)
        }
    })

    socket.on('init-game-state', (state) => {
        window.state = state
        log(window.state)
        log('Initialized game state')
        initGameState()
    })
    
    socket.emit('join-game', game, player)
    $('#spinner').show()
}

$('#gameOverModal').on('hide.bs.modal', function() {
    return false
})

// TODO: remove duplicate #home
$('#home').on('click', function() {
    $('#gameOverModal').modal('hide')
    location.href = '/'
})

$('#leave').on('click', function() {
    location.href = '/'
})

function sendGameState() {
    log('Sending game-state')
    log(window.state)
    socket.emit('update-game-state', game, window.state)
}

$(function () {
    initGame()
})

socket.on('game-state-updated', (state) => {
    window.state = state
    //log('Updated game-state')
    //log(window.state)
    drawGameState()
})