const router  = require('express').Router()

router.get('/', (req, res) => {
    res.render('home', { title: 'Home' })
})

router.get('/rules', (req, res) => {
    res.render('rules', { title: 'Rules' })
})

module.exports = router