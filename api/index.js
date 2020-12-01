const DEBUG = true

const State = {
    UNKNOWN: 0,
    INITIALIZED: 1,
    STARTED: 2,
    FINISHED: 4
}

let clients = {}
let players = {}
let games = {}

// Returns a unique player identifier
let generatePlayer = (function () {
    let count = 0
    return function () {
        return count++
    }
})()

// Returns a unique game identifier
let generateGame = (function () {
    let count = 0
    return function () {
        return count++
    }
})()

const routes = (app) => {
    app.use((req, res, next) => {
        if (!req.session.player) {
            const player = {
                id: generatePlayer(),
                socket: null
            }
            req.session.player = player
            res.cookie('player', player.id)
            players[player.id] = player
        }
        next()
    })

    app.get('/', (req, res) => {
        res.render('home', {
            title: 'Home'
        })
    })

    app.get('/rules', (req, res) => {
        res.render('rules', {
            title: 'Rules'
        })
    })

    app.get('/game/:id', (req, res) => {
        const game = req.params.id
        const player = req.session.player.id
        const role = games[game].players[player].role
        const template = role == 1 ? 'game/chemist' : (role == 2 ? 'game/researcher' : 'error')
        res.render(template, {
            title: 'Game'
        })
    })

    app.use(errorHandler)
}

function errorHandler(err, req, res, next) {
    console.error(err.stack)
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).render('error', {
        title: 'Error'
    })
}

const sockets = (io) => {
    io.on('connection', (socket) => {
        connect(socket)

        socket.on('find-game', (player) => {
            findGame(player, socket)
        })

        socket.on('join-game', (game, player) => {
            joinGame(game, player, socket)
        })

        socket.on('signal', (id, signal) => {
            if (!clients[id]) return
            clients[data.socket_id].emit('signal', {
                id: socket.id,
                signal
            })
        })

        socket.on('disconnect', () => {
            socket.broadcast.emit('removePeer', socket.id)
            disconnect(socket)
        })

        socket.on('initSend', (id) => {
            clients[id].emit('initSend', socket.id)
        })
    })
}

function connect(socket) {
    log(`Client ${socket.id} connected`)

    clients[socket.id] = socket

    for (let client in clients) {
        if (client === socket.id) continue
        clients[client].emit('initReceive', socket.id)
    }
}

function disconnect(socket) {
    log(`Client ${socket.id} disconnected`)
    
    delete clients[socket.id]
}

function findGame(player, socket) {
    log(`Player ${player} finding game`)

    // Set player's socket
    players[player].socket = socket

    // Find a game that hasn't started
    let game = findAvailableGame()

    // Determine the player's role
    let role = 0 // 0=Other, 1=Chemist, 2=Researcher
    if (Object.keys(games[game].players).length < 2) {
        role = Object.keys(games[game].players).length + 1
    }

    // Have that player join that game
    games[game].players[player] = {
        id: player,
        role,
        ready: false,
        socket
    }

    // Start game when we have all players
    if (canInitializeGame(game)) {
        // Flag the game as initialized
        games[game].state = State.INITIALIZED

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
            games[game].players[player].socket.emit('found-game', game)
        }
    }
}

function joinGame(game, player, socket) {
    log(`Player ${player} joining game`)

    // Join the game room
    //socket.join(game)

    // Update player's socket
    players[player].socket = socket
    games[game].players[player].socket = socket

    games[game].players[player].ready = true

    // Notify playing players that the game is starting
    if (canStartGame(game)) {
        // Flag the game as started
        games[game].state = State.STARTED

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
            let role = games[game].players[player].role
            games[game].players[player].socket.emit('game-joined', role)
        }
    }
}

function findAvailableGame() {
    // Return a game that is not yet started
    for (let game in games) {
        if (games[game].state == State.INITIALIZED) continue
        return games[game].id
    }

    // Return a new game
    let game = generateGame()
    games[game] = {
        id: game,
        players: {},
        status: State.INITIALIZING
    }
    return game
}

function canInitializeGame(game) {
    // Check that we have a chemist
    if (!roleExists(game, 1)) return false

    // Check that we have a researcher
    if (!roleExists(game, 2)) return false

    return true
}

function roleExists(game, role) {
    for (let player in games[game].players) {
        if (games[game].players[player].role == role) return true
    }
    return false
}

function canStartGame(game) {
    for (let player in games[game].players) {
        if (!isPlayablePlayer(game, player)) continue
        let ready = games[game].players[player].ready
        if (!ready) return false
    }
    return true
}

function isPlayablePlayer(game, player) {
    let role = games[game].players[player].role
    return role == 1 || role == 2
}

function log(str) {
    if (DEBUG) {
        console.log(str)
    }
}

module.exports = {
    routes,
    sockets
}