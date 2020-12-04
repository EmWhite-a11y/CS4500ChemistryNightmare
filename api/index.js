const DEBUG = false

// Game statuses
const Status = {
    WAITING: 0,
    READY: 1,
    STARTED: 2,
    WON: 3,
    LOST: 4
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
let games = {}

// Returns a unique player identifier
let generatePlayer = (function () {
    let count = 0

    // Every time this function is called, increment count
    return function () {
        return count++
    }
})()

// Returns a unique game identifier
let generateGame = (function () {
    let count = 0

    // Every time this function is called, increment count
    return function () {
        return count++
    }
})()

const routes = (app) => {
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
        res.render('home', {
            title: 'Home'
        })
    })

    // Handler for the rules page
    app.get('/rules', (req, res) => {
        // Render the rules page on server
        res.render('rules', {
            title: 'Rules'
        })
    })

    // Handler for the game page
    app.get('/game/:id', (req, res) => {
        let game = req.params.id
        let player = req.session.player.id
        let role = games[game].players[player].role
        let template = role == Role.CHEMIST ? 'game/chemist' : (role == Role.RESEARCHER ? 'game/researcher' : 'error')
        
        // Render game page on server
        res.render(template, {
            title: 'Game'
        })
    })

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
        title: 'Error'
    })
}

const sockets = (io) => {
    io.on('connection', (socket) => {
        connect(io, socket)

        socket.on('find-game', (player) => {
            findGame(io, socket, player)
        })

        socket.on('cancel-game-search', (player) => {
            cancelGameSearch(io, socket, player)
        })

        socket.on('join-game', (game, player) => {
            joinGame(io, socket, game, player)
        })

        socket.on('update-game-state', (game, state) => {
            updateGameState(io, socket, game, state)
        })

        socket.on('signal', (data) => {
            if (!clients[data.id]) return
            console.log(`Sending signal from ${socket.id} to ${data.id}`)
            clients[data.id].emit('signal', {
                id: socket.id,
                signal: data.signal
            })
        })

        socket.on('disconnect', () => {
            socket.broadcast.emit('removePeer', socket.id)
            disconnect(io, socket)
        })

        socket.on('initSend', (id) => {
            console.log(`${socket.id} sending initSend to ${id}`)
            clients[id].emit('initSend', socket.id)
        })
    })
}

function updateGameState(io, socket, game, state) {
    log('Updating game-state')
    log(state)

    games[game].state = state

    if (checkBeakerMatches(game)) endGame(io, game, Status.WON)
    
    io.to(game).emit('game-state-updated', state)

    log('Updated game-state')
}

function checkBeakerMatches(game) {
    if (games[game].state.researcher.beaker.volume !== games[game].state.chemist.beaker.volume) return false
    if (games[game].state.researcher.beaker.color.red !== games[game].state.chemist.beaker.color.red) return false
    if (games[game].state.researcher.beaker.color.yellow !== games[game].state.chemist.beaker.color.yellow) return false
    if (games[game].state.researcher.beaker.color.blue !== games[game].state.chemist.beaker.color.blue) return false
    if (games[game].state.researcher.beaker.temperature !== games[game].state.chemist.beaker.temperature) return false
    if (games[game].state.researcher.beaker.pH !== games[game].state.chemist.beaker.pH) return false
    return true
}

function connect(io, socket) {
    console.log(`Client ${socket.id} connected`)

    clients[socket.id] = socket

    for (let id in clients) {
        if (id === socket.id) continue
        console.log(`Sending initReceive to ${socket.id}`)
        clients[id].emit('initReceive', socket.id)
    }
}

function disconnect(io, socket) {
    console.log(`Client ${socket.id} disconnected`)
    
    delete clients[socket.id]
    
    let game = findGameFromSocket(socket)
    let player = findPlayerFromSocket(socket)

    if (player !== null) {
        log(`Player ${player} left game ${game}`)
    }
    
    if (game !== null) {
        if (games[game].status === Status.STARTED) {
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
}

function findGame(io, socket, player) {
    log(`Player ${player} finding game`)

    // Set player's socket
    players[player].socket = socket

    // Find a game that hasn't started
    let game = findAvailableGame()

    // Determine the player's role
    let role = Role.UNKNOWN
    let count = Object.keys(games[game].players).length
    if (count == 0) role = Role.CHEMIST
    else if (count == 1) role = Role.RESEARCHER

    log(`Determined role ${role}`)

    // Have that player join that game
    games[game].players[player] = {
        id: player,
        role,
        ready: false,
        socket,
        timeout: null
    }

    log(`Player ${player} created and added to game ${game}`)
    log(games[game])

    // Start game when we have all players
    if (canInitializeGame(game)) {
        // Flag the game as initialized
        games[game].status = Status.READY

        log(`Game ${game} initialized`)

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
            log(`Notifying player ${player} game ${game} found`)
            games[game].players[player].socket.emit('found-game', game)
        }

        //games[game].timeout = setTimeout(function() {
        //    endGame(io, game, Status.LOST)
        //}, 60 * 1000)
    } else {
        log(`Game ${game} not initialized yet`)
        log(games[game])
    }
}

function endGame(io, game, status) {
    io.in(game).emit('game-finished', status)
    //if (games[game].timeout) clearTimeout(games[game].timeout)
}

function cancelGameSearch(io, socket, player) {
    socket.emit('game-search-cancelled')
    for (let game in games) {
        if (games[game].players[player]) {
            delete games[game]
        }
    }
}

function joinGame(io, socket, game, player) {
    log(`Player ${player} joining game`)

    // Join the game room
    socket.join(game)

    // Update player's socket
    players[player].socket = socket
    games[game].players[player].socket = socket

    games[game].players[player].ready = true

    // Notify playing players that the game is starting
    if (canStartGame(game)) {
        // Flag the game as started
        games[game].status = Status.STARTED

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
            let role = games[game].players[player].role
            games[game].players[player].socket.emit('game-joined', role)
            games[game].players[player].socket.emit('init-game-state', games[game].state)
        }
    }
}

function findAvailableGame() {
    log('Finding an available game')
    
    // Return a game that is not yet started, which means it's still waiting for another player
    for (let game in games) {
        if (games[game].status === Status.WAITING) return game
    }

    log('Setting up a new game')

    // Set up a new game
    let game = generateGame()
    games[game] = {
        id: game,
        players: {},
        status: Status.WAITING,
        state: {
            time: 7,
            researcher: {
                beaker: {
                    volume: 1,
                    color: {
                        red: 2,
                        yellow: 3,
                        blue: 4
                    },
                    temperature: 5,
                    pH: 6
                }
            },
            chemist: {
                beaker: {
                    volume: 6,
                    color: {
                        red: 5,
                        yellow: 4,
                        blue: 3
                    },
                    temperature: 2,
                    pH: 1
                }
            }
        }
    }

    log('New game created')
    log(games[game])

    // Return the new game
    return game
}

function canInitializeGame(game) {
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
    return role == Role.CHEMIST || role == Role.RESEARCHER
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