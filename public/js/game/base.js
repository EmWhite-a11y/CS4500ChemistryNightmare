const VOLUME_MAX = 10

// Collection of all allowed beaker colors
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

// Initialize socket connection
const socket = io()
// Get this page's game id
const game = location.href.match(/([^\/]*)\/*$/)[1]
// Initialize empty state
let state = null

function initGame() {
    // Handler for when a game is finished
    socket.on('game-finished', (status, reason) => {
        $('#gameOverModal').modal('show')
        if (status === GameStatus.WON) $('#game-over-title').html('Game Won!')
        else if (status === GameStatus.LOST) $('#game-over-title').html('Game Lost!')
        $('#game-over-message').html(reason)
    })

    // Handler for when a game is to be left
    socket.on('leave-game', () => {
        location.href = '/'
    })

    // Handler for when a game is joined
    socket.on('game-joined', (role) => {
        // Hide loading spinner
        $('#spinner').hide()
        log(`Player ${player} has role ${role} for game ${game}`)
        // Have researcher set up voice chat
        if (role === PlayerRole.RESEARCHER) {
            setTimeout(function() {
                socket.emit('vc-init')
                log('Sent vc-init')
            }, 5000)
        }
    })

    // Handler for when a game is initialized
    socket.on('init-game-state', (state) => {
        window.state = state
        log(window.state)
        log('Initialized game state')
        initGameState()
    })
    
    // Emit we want to join this page's game
    socket.emit('join-game', game, player)
    // Show loading spinner
    $('#spinner').show()
}

// Handler for when the game over modal is to be closed
$('#gameOverModal').on('hide.bs.modal', function() {
    // Don't allow it to be closed
    return false
})

// Notifies server of game being updated
function sendGameState() {
    log('Sending game-state')
    log(window.state)
    socket.emit('update-game-state', game, window.state)
}

// Handler for when game state is updated
socket.on('game-state-updated', (state) => {
    window.state = state
    drawGameState()
})

// Execute once page is fully loaded
$(function () {
    initGame()
})