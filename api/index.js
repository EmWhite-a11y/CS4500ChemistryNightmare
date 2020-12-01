const DEBUG = true

<<<<<<< HEAD
// Game states
const State = {
    WAITING: 0,
    READY: 1,
    STARTED: 2,
    FINISHED: 3
}

// Player roles
const Role = {
    UNKNOWN: 0,
    CHEMIST: 1,
    RESEARCHER: 2
}

// Socket connections
let clients = {}

// Connected users
let players = {}

// Active games
=======
const State = {
    UNKNOWN: 0,
    INITIALIZED: 1,
    STARTED: 2,
    FINISHED: 4
}

let clients = {}
let players = {}
>>>>>>> develop
let games = {}

// Returns a unique player identifier
let generatePlayer = (function () {
    let count = 0
<<<<<<< HEAD

    // Every time this function is called, increment count
=======
>>>>>>> develop
    return function () {
        return count++
    }
})()

// Returns a unique game identifier
let generateGame = (function () {
    let count = 0
<<<<<<< HEAD

    // Every time this function is called, increment count
=======
>>>>>>> develop
    return function () {
        return count++
    }
})()

const routes = (app) => {
<<<<<<< HEAD
    // Middleware to assign a user a session
    app.use((req, res, next) => {
        let player = null

        // Create a new session if one doesn't exist
        if (!req.session.player) {
            // Create a new player
            player = {
                id: generatePlayer(), // Player's identifier
                socket: null // Player's socket connection
            }

            // Attach the player to the session
            req.session.player = player

            // Cache the player for later use
            players[player.id] = player

            // Store the player's identifier on the client's web browser
            res.cookie('player', player.id)
        }

        player = req.session.player

        // Check if the session's player is cached
        if (!players[player.id]) {
            // Cache the session's player if it's missing
            players[player.id] = player

            // Store the player's identifier on the client's web browser
            res.cookie('player', player.id)
        }

        // Move to the next handler
        next()
    })

    // Handler for the home page
    app.get('/', (req, res) => {
        // Render the home page on server
=======
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
>>>>>>> develop
        res.render('home', {
            title: 'Home'
        })
    })

<<<<<<< HEAD
    // Handler for the rules page
    app.get('/rules', (req, res) => {
        // Render the rules page on server
=======
    app.get('/rules', (req, res) => {
>>>>>>> develop
        res.render('rules', {
            title: 'Rules'
        })
    })

<<<<<<< HEAD
    // Handler for the game page
    app.get('/game/:id', (req, res) => {
        let game = req.params.id
        let player = req.session.player.id
        let role = games[game].players[player].role
        let template = role == Role.CHEMIST ? 'game/chemist' : (role == Role.RESEARCHER ? 'game/researcher' : 'error')
        
        // Render game page on server
=======
    app.get('/game/:id', (req, res) => {
        const game = req.params.id
        const player = req.session.player.id
        const role = games[game].players[player].role
        const template = role == 1 ? 'game/chemist' : (role == 2 ? 'game/researcher' : 'error')
>>>>>>> develop
        res.render(template, {
            title: 'Game'
        })
    })

<<<<<<< HEAD
    // Handler that catches anything that couldn't be handled
    app.use(errorHandler) // TODO: doesn't seem to catch /game
}

function errorHandler(err, req, res, next) {
    // Output the error to the terminal
    console.error(err.stack)

    if (res.headersSent) {
        return next(err)
    }

    // Render the error page
    res.status(err.status || 500).render('error', {
=======
    app.use(errorHandler)
}

function errorHandler(err, req, res, next) {
    console.error(err.stack)
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).render('error', {
>>>>>>> develop
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

<<<<<<< HEAD
        socket.on('update-count', (game, count) => {
            socket.to(game).emit('count-updated', count)
            if (count == 10) io.in(game).emit('game-finished')
        })

        socket.on('signal', (data) => {
            if (!clients[data.id]) return
            console.log(`Sending signal from ${socket.id} to ${data.id}`)
            clients[data.id].emit('signal', {
                id: socket.id,
                signal: data.signal
=======
        socket.on('signal', (id, signal) => {
            if (!clients[id]) return
            clients[data.socket_id].emit('signal', {
                id: socket.id,
                signal
>>>>>>> develop
            })
        })

        socket.on('disconnect', () => {
            socket.broadcast.emit('removePeer', socket.id)
            disconnect(socket)
        })

        socket.on('initSend', (id) => {
<<<<<<< HEAD
            console.log(`${socket.id} sending initSend to ${id}`)
=======
>>>>>>> develop
            clients[id].emit('initSend', socket.id)
        })
    })
}

function connect(socket) {
<<<<<<< HEAD
    console.log(`Client ${socket.id} connected`)

    clients[socket.id] = socket

    for (let id in clients) {
        if (id === socket.id) continue
        console.log(`Sending initReceive to ${socket.id}`)
        clients[id].emit('initReceive', socket.id)
=======
    log(`Client ${socket.id} connected`)

    clients[socket.id] = socket

    for (let client in clients) {
        if (client === socket.id) continue
        clients[client].emit('initReceive', socket.id)
>>>>>>> develop
    }
}

function disconnect(socket) {
<<<<<<< HEAD
    console.log(`Client ${socket.id} disconnected`)
    
    delete clients[socket.id]
    
    let game = findGameFromSocket(socket)
    let player = findPlayerFromSocket(socket)

    if (player !== null) {
        log(`Player ${player} left game ${game}`)
    }
    if (game !== null) {
        if (games[game].state === State.STARTED) {
            log(`Game ${game} ending`)

            for (let player in games[game].players) {
                players[player].socket = null
                if (games[game].players[player].socket.id === socket.id) continue
                log(`Notifying player ${player} to leave game ${game}`)
                games[game].players[player].socket.emit('leave-game')
            }

            log(`Deleting game ${game}`)
            delete games[game]
        }
    }
}

function findGameFromSocket(socket) {
    for (let game in games) {
        for (let player in games[game].players) {
            if (games[game].players[player].socket.id == socket.id) return game
        }
    }
    return null
}

function findPlayerFromSocket(socket) {
    for (let game in games) {
        for (let player in games[game].players) {
            if (games[game].players[player].socket.id == socket.id) return player
        }
    }
    return null
=======
    log(`Client ${socket.id} disconnected`)
    
    delete clients[socket.id]
>>>>>>> develop
}

function findGame(player, socket) {
    log(`Player ${player} finding game`)

    // Set player's socket
    players[player].socket = socket

    // Find a game that hasn't started
    let game = findAvailableGame()

    // Determine the player's role
<<<<<<< HEAD
    let role = Role.UNKNOWN
    let count = Object.keys(games[game].players).length
    if (count == 0) role = Role.CHEMIST
    else if (count == 1) role = Role.RESEARCHER

    log(`Determined role ${role}`)
=======
    let role = 0 // 0=Other, 1=Chemist, 2=Researcher
    if (Object.keys(games[game].players).length < 2) {
        role = Object.keys(games[game].players).length + 1
    }
>>>>>>> develop

    // Have that player join that game
    games[game].players[player] = {
        id: player,
        role,
        ready: false,
        socket
    }

<<<<<<< HEAD
    log(`Player ${player} created and added to game ${game}`)
    log(games[game])

    // Start game when we have all players
    if (canInitializeGame(game)) {
        // Flag the game as initialized
        games[game].state = State.READY

        log(`Game ${game} initialized`)
=======
    // Start game when we have all players
    if (canInitializeGame(game)) {
        // Flag the game as initialized
        games[game].state = State.INITIALIZED
>>>>>>> develop

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
<<<<<<< HEAD
            log(`Notifying player ${player} game ${game} found`)
            games[game].players[player].socket.emit('found-game', game)
        }
    } else {
        log(`Game ${game} not initialized yet`)
        log(games[game])
=======
            games[game].players[player].socket.emit('found-game', game)
        }
>>>>>>> develop
    }
}

function joinGame(game, player, socket) {
    log(`Player ${player} joining game`)

    // Join the game room
<<<<<<< HEAD
    socket.join(game)
=======
    //socket.join(game)
>>>>>>> develop

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
<<<<<<< HEAD
    log('Finding an available game')
    
    // Return a game that is not yet started, which means it's still waiting for another player
    for (let game in games) {
        if (games[game].state === State.WAITING) return game
    }

    log('Setting up a new game')

    // Set up a new game
=======
    // Return a game that is not yet started
    for (let game in games) {
        if (games[game].state == State.INITIALIZED) continue
        return games[game].id
    }

    // Return a new game
>>>>>>> develop
    let game = generateGame()
    games[game] = {
        id: game,
        players: {},
<<<<<<< HEAD
        state: State.WAITING
    }

    log('New game created')
    log(games[game])

    // Return the new game
=======
        status: State.INITIALIZING
    }
>>>>>>> develop
    return game
}

function canInitializeGame(game) {
<<<<<<< HEAD
    log('Checking if can initialize game')
    
    // Check that we have a chemist
    if (!roleExists(game, Role.CHEMIST)) {
        log('Missing chemist')
        return false
    }

    log('Chemist found')

    // Check that we have a researcher
    if (!roleExists(game, Role.RESEARCHER)) {
        log('Missing researcher')
        return false
    }

    log('Researcher found')
=======
    // Check that we have a chemist
    if (!roleExists(game, 1)) return false

    // Check that we have a researcher
    if (!roleExists(game, 2)) return false
>>>>>>> develop

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
<<<<<<< HEAD
    return role == Role.CHEMIST || role == Role.RESEARCHER
=======
    return role == 1 || role == 2
>>>>>>> develop
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