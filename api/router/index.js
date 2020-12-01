const Player = require('../../models/player')

const bootstrap = (app) => {
    app.use((req, res, next) => {
        if (!req.session.player) {
            const newPlayer = Player.createPlayer()
            req.session.player = newPlayer
            res.cookie('playerId', newPlayer.id)
        }
        next()
    })

    app.use('/', require('./home'))
    app.use('/lobby', require('./lobby'))
    app.use('/game', require('./game'))

    app.use((req, res) => {
        res.status(404)
        res.render('error', { title: 'Error' })
    })
}

module.exports = bootstrap