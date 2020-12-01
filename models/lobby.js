const Game = require('./game')

class Lobby {
    static games = {}

    static startGame(player) {
        const newGame = Game.createGame()
        this.games[newGame.id] = newGame
        newGame.joinGame(player)
        console.log(`Player ${player.id} starting game ${newGame.id}`)
        return newGame.id
    }

    static findGame(player) {
        console.log(`findGame: ${player.id}`)
        return 420
    }

    static joinGame(room, player) {
        console.log(`joinGame: ${room}, ${player.id}`)
        return true
    }
}

module.exports = Lobby