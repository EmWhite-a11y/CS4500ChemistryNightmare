const router  = require('express').Router()

router.get('/:id', (req, res) => {
    const gameId = req.params.id;
    res.render('game', { title: 'Game', game: gameId })
})

module.exports = router