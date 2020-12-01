const socket = io()

$('#play').on('click', function() {
    findGame()
})

$('#rules').on('click', function() {
    openRules()
})

function findGame() {
    socket.on('found-game', game => {
        location.href = `/game/${game}`
    })
    socket.emit('find-game', $.cookie('player'))
}

function openRules() {
    location.href = '/rules'
}