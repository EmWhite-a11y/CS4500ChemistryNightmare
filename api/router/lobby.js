const router  = require('express').Router()
const Lobby = require('../../models/lobby')

router.get('/', (req, res) => {
    res.render('lobby', { title: 'Lobby' })
})

router.post('/start', (req, res) => {
    res.json({ gameId: Lobby.startGame(req.session.player) })
})

router.post('/find', (req, res) => {
    res.json({ gameId: Lobby.findGame(req.session.player) })
})

router.post('/join/:id', (req, res) => {
    res.json({ status: Lobby.joinGame(req.body.room, req.session.player) })
})

module.exports = router