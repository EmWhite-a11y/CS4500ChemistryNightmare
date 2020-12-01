class PlayerType {
    static UNKNOWN = new PlayerType(0, 'Unknown')
    static RESEARCHER = new PlayerType(1, 'Researcher')
    static CHEMIST = new PlayerType(2, 'Chemist')
    static SPECTATOR = new PlayerType(3, 'Spectator')

    constructor(id, name) {
        this._id = id
        this._name = name
    }

    getId() {
        return this._id
    }

    getName() {
        return this._name
    }
}