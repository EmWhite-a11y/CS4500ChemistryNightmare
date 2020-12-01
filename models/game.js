const uuid = require('uuid')

class Game {
    players = {}
    researcher = null
    chemist = null

    constructor(id) {
        this.id = id
    }

    joinGame(player) {
        this.players[player.id] = player
        console.log(`Player ${player.id} joined game ${this.id}`)
    }

    startGame() {
        let size = Object.keys(this.players).length
        if (size == 0) {
            if (this.researcher == null) {
                this.researcher = player
            }
        } else if (size == 1) {
            if (this.chemist == null) {
                this.chemist = player
            }
        }

        console.log(`researcher: ${this.researcher != null ? this.researcher.id : ''}, chemist: ${this.chemist != null ? this.chemist.id : ''}`)

        if (this.researcher != null && this.researcher.id == player.id) {
            this.researcher = null
        }
        if (this.chemist != null && this.chemist.id == player.id) {
            this.chemist = null
        }
    }

    leaveGame(player) {
        delete this.players[player.id]
        console.log(`Player ${player.id} left game ${this.id}`)
    }

    static createGame() {
        return new Game(uuid.v4())
    }
}

module.exports = Game