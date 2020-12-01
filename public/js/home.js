const socket = io()

$('#play').on('click', function() {
    findGame()
})

$('#rules').on('click', function() {
    openRules()
})

function findGame() {
    socket.on('found-game', game => {
<<<<<<< HEAD
        $('#spinner').hide()
        $('#play').removeAttr('disabled');
        $('#rules').removeAttr('disabled');
        location.href = `/game/${game}`
    })
    socket.emit('find-game', $.cookie('player'))
    $('#spinner').show()
    $('#play').attr('disabled', true);
    $('#rules').attr('disabled', true);
=======
        location.href = `/game/${game}`
    })
    socket.emit('find-game', $.cookie('player'))
>>>>>>> develop
}

function openRules() {
    location.href = '/rules'
}