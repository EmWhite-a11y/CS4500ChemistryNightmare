const DEBUG = true

const GameStatus = {
    WAITING: 0,
    READY: 1,
    STARTED: 2,
    WON: 3,
    LOST: 4
}

const PlayerRole = {
    UNKNOWN: 0,
    CHEMIST: 1,
    RESEARCHER: 2
}

const stateTemplate = {
    time: null, // Seconds
    researcher: {
        beaker: null
    },
    chemist: {
        beaker: null
    }
}

const beakerTemplate = {
    volume: null, // Liters
    color: {
        red: null,
        yellow: null,
        blue: null
    },
    temperature: null, // Celsius
    pH: null // Ranges from 0 to 14
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
        let template = role == PlayerRole.CHEMIST ? 'game/chemist' : (role == PlayerRole.RESEARCHER ? 'game/researcher' : 'error')
        
        // Render game page on server
        res.render(template, {
            title: 'Game'
        })
    })

    // Handler that catches anything that couldn't be handled
    app.use((req, res) => {
        // Render the 404 page
        res.status(404).render('404', {
            title: '404'
        })
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

        socket.on('vc-init', () => {
            for (let id in clients) {
                if (id === socket.id) continue
                console.log(`${id} sending vc-init-receive to ${socket.id}`)
                clients[id].emit('vc-init-receive', socket.id)
            }
        })

        socket.on('vc-init-send', (id) => {
            console.log(`${socket.id} sending vc-init-send to ${id}`)
            clients[id].emit('vc-init-send', socket.id)
        })

        socket.on('vc-signal', (data) => {
            if (!clients[data.id]) return
            log(`Sending vc-signal from ${socket.id} to ${data.id}`)
            clients[data.id].emit('vc-signal', {
                id: socket.id,
                signal: data.signal
            })
        })

        socket.on('disconnect', () => {
            disconnect(io, socket)
        })
    })
}

function updateGameState(io, socket, game, state) {
    log('Updating game-state')
    log(state)

    games[game].state = state

    io.to(game).emit('game-state-updated', state)

    if (checkBeakerMatches(game)) endGame(io, game, GameStatus.WON)

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
}

function disconnect(io, socket) {
    console.log(`Client ${socket.id} disconnected`)
    
    delete clients[socket.id]
    
    let game = findGameFromSocket(socket)
    let player = findPlayerFromSocket(socket)

    socket.to(game).emit('vc-remove', socket.id)

    if (player !== null) {
        log(`Player ${player} left game ${game}`)
    }
    
    if (game !== null) {
        if (games[game].status === GameStatus.STARTED) {
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
    let role = PlayerRole.UNKNOWN
    let count = Object.keys(games[game].players).length
    if (count == 0) role = PlayerRole.CHEMIST
    else if (count == 1) role = PlayerRole.RESEARCHER

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
        games[game].status = GameStatus.READY

        log(`Game ${game} initialized`)

        // Notify playing players that a game was found
        for (let player in games[game].players) {
            if (!isPlayablePlayer(game, player)) continue
            log(`Notifying player ${player} game ${game} found`)
            games[game].players[player].socket.emit('found-game', game)
        }

        //games[game].timeout = setTimeout(function() {
        //    endGame(io, game, GameStatus.LOST)
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
        games[game].status = GameStatus.STARTED

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
        if (games[game].status === GameStatus.WAITING) return game
    }

    log('Setting up a new game')

    // Set up a new game
    let game = generateGame()
    games[game] = {
        id: game,
        players: {},
        status: GameStatus.WAITING,
        state: generateInitialGameState()
    }

    log('New game created')
    log(games[game])

    // Return the new game
    return game
}

function generateInitialGameState() {
    let gameState = JSON.parse(JSON.stringify(stateTemplate))
    let researcherBeaker = JSON.parse(JSON.stringify(beakerTemplate))
    let chemistBeaker = JSON.parse(JSON.stringify(beakerTemplate))

    gameState.researcher.beaker = researcherBeaker
    gameState.chemist.beaker = chemistBeaker

    gameState.time = 0
    
    let mask = [0b011, 0b101, 0b110][getRandomInterval(0, 2)]

    gameState.researcher.beaker.color.red = 0
    gameState.researcher.beaker.color.yellow = 0
    gameState.researcher.beaker.color.blue = 0

    for (let i = 0; i < 3; i++) {
        let choice = getRandomBoolean()
        if (mask & 0b011) {
            if (choice) gameState.researcher.beaker.color.yellow++
            else gameState.researcher.beaker.color.blue++
        } else if (mask & 0b101) {
            if (choice) gameState.researcher.beaker.color.red++
            else gameState.researcher.beaker.color.blue++
        } else if (mask & 0b110) {
            if (choice) gameState.researcher.beaker.color.red++
            else gameState.researcher.beaker.color.yellow++
        }
        gameState.researcher.beaker.volume++
    }

    gameState.researcher.beaker.temperature = getRandomInterval(10, 30)
    gameState.researcher.beaker.pH = getRandomInterval(0, 14)

    gameState.chemist.beaker.volume = 0
    gameState.chemist.beaker.color.red = 0
    gameState.chemist.beaker.color.yellow = 0
    gameState.chemist.beaker.color.blue = 0
    gameState.chemist.beaker.temperature = 20
    gameState.chemist.beaker.pH = 7

    return gameState
}

function canInitializeGame(game) {
    log('Checking if can initialize game')
    
    // Check that we have a chemist
    if (!roleExists(game, PlayerRole.CHEMIST)) {
        log('Missing chemist')
        return false
    }

    log('Chemist found')

    // Check that we have a researcher
    if (!roleExists(game, PlayerRole.RESEARCHER)) {
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
    return role == PlayerRole.CHEMIST || role == PlayerRole.RESEARCHER
}

function getRandomInterval(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min)
}

function getRandomBoolean() {
    return Math.random() < 0.5
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