function loadGame(callback) {
    $('#spinner').show()
    setTimeout(function() {
        $('#spinner').hide()
        callback()
    }, 1000)
}

$('#startGame').on('click', function () {
    $.post('/lobby/start', function (data) {
        loadGame(function() {
            const playerId = $.cookie('playerId')
            const gameId = data.gameId
            console.log(`Player ${playerId} starting game ${gameId}`)
            location.href = `/game/${gameId}`
        })
    });
});

$('#findGame').on('click', function () {
    $.post('/lobby/find', function (data) {
        loadGame(function() {
            const playerId = $.cookie('playerId')
            const gameId = data.gameId
            console.log(`Player ${playerId} Found game ${gameId}`)
            location.href = `/game/${gameId}`
        })
    });
});

$('#joinGame').on('click', function () {
    const gameId = $('#gameId').val()
    $.post(`/lobby/join/${gameId}`, function (data) {
        const playerId = $.cookie('playerId')
        const status = data.status
        if (status) {
            console.log(`Player ${playerId} joining game ${gameId}`)
            location.href = `/game/${gameId}`
        } else {
            console.log(`Player ${playerId} unable to join game ${gameId}`)
        }
    });
});