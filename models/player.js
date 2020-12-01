const uuid = require('uuid')

class Player {
    game = null
    
    constructor(id) {
        this.id = id
    }

    static createPlayer() {
        return new Player(uuid.v4())
    }
}

module.exports = Player