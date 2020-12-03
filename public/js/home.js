const socket = io()
const loadingMessageInterval = 500
const numLoadingMessageDots = 3
let loadingCounter = 0
let loadingInterval = null

$('#play').on('click', function() {
    startGameSearch()
})

$('#rules').on('click', function() {
    location.href = '/rules'
})

$('#cancel').on('click', function() {
    cancelGameSearch()
})

function startGameSearch() {
    socket.on('found-game', (game) => {
        $('#loadingMessage').html('Found Game')
        
        $('#spinner').hide()
        clearInterval(loadingInterval)
        loadingCounter = 0
        
        location.href = `/game/${game}`
    })
    
    socket.emit('find-game', player)

    $('#spinner').show()

    $('#loadingMessage').html('Finding Game')
    loadingInterval = setInterval(function() {
        $('#loadingMessage').html(`Finding Game${'.'.repeat(loadingCounter++ % (numLoadingMessageDots + 1))}`)
    }, loadingMessageInterval)
}

function cancelGameSearch() {
    socket.on('game-search-cancelled', () => {
        $('#spinner').hide()
        clearInterval(loadingInterval)
        loadingCounter = 0
    })

    socket.emit('cancel-game-search', player)
}

$('#loadingModal').on('hide.bs.modal', function() {
    $('#spinner').hide()
    clearInterval(loadingInterval)
    loadingCounter = 0
})