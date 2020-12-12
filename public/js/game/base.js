const VOLUME_MAX = 10

class ColorType {
    static UNKNOWN = new ColorType('Unknown', { red: 0, yellow: 0, blue: 0 })
    // Primary colors
    static RED = new ColorType('Red', { red: 1, yellow: 0, blue: 0 })
    static YELLOW = new ColorType('Yellow', { red: 0, yellow: 1, blue: 0 })
    static BLUE = new ColorType('Blue', { red: 0, yellow: 0, blue: 1 })
    // Secondary colors
    static ORANGE = new ColorType('Red', { red: 1, yellow: 1, blue: 0 })
    static GREEN = new ColorType('Yellow', { red: 0, yellow: 1, blue: 1 })
    static VIOLET = new ColorType('Blue', { red: 1, yellow: 0, blue: 1 })
    // Tertiary colors
    static YELLOW_ORANGE = new ColorType('Red', { red: 1, yellow: 2, blue: 0 })
    static RED_ORANGE = new ColorType('Yellow', { red: 2, yellow: 1, blue: 0 })
    static RED_VIOLET = new ColorType('Blue', { red: 2, yellow: 0, blue: 1 })
    static BLUE_VIOLET = new ColorType('Red', { red: 1, yellow: 0, blue: 2 })
    static BLUE_GREEN = new ColorType('Yellow', { red: 0, yellow: 1, blue: 2 })
    static YELLOW_GREEN = new ColorType('Blue', { red: 0, yellow: 2, blue: 1 })

    constructor(name, ratio) {
        this.name = name
        this.ratio = ratio
    }
}

const socket = io()

const game = location.href.match(/([^\/]*)\/*$/)[1]
let state = null

function initGame() {
    socket.on('game-finished', (status, reason) => {
        $('#gameOverModal').modal('show')
        if (status === GameStatus.WON) $('#game-over-title').html('Game Won!')
        else if (status === GameStatus.LOST) $('#game-over-title').html('Game Lost!')
        $('#game-over-message').html(reason)
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

function sendGameState() {
    log('Sending game-state')
    log(window.state)
    socket.emit('update-game-state', game, window.state)
}

socket.on('game-state-updated', (state) => {
    window.state = state
    drawGameState()
})

// Execute once page is fully loaded
$(function () {
    initGame()
})