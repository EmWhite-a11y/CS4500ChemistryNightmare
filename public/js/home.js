const socket = io() // Live connection to server
const loadingMessageInterval = 500
const numLoadingMessageDots = 3
let loadingCounter = 0
let loadingInterval = null

// Handler for when the play button is clicked
$('#play').on('click', function() {
    startGameSearch()
})

// Handler for when the rules button is clicked
$('#rules').on('click', function() {
    location.href = '/rules'
})

// Handler for when cancelling finding a game
$('#cancel').on('click', function() {
    cancelGameSearch()
})

// Handler for when clicking outside the loading game modal
$('#loadingModal').on('hide.bs.modal', function() {
    $('#spinner').hide()
    clearInterval(loadingInterval)
    loadingCounter = 0
})

// Start a game search
function startGameSearch() {
    // Register handler when a game is found
    socket.on('found-game', (game) => {
        // Reset game loading message
        $('#loadingMessage').html('Found Game')
        $('#spinner').hide()
        clearInterval(loadingInterval)
        loadingCounter = 0
        
        // Go to game page
        location.href = `/game/${game}`
    })
    
    // Emit we want to find a game
    socket.emit('find-game', player)

    // Show the loading spinner
    $('#spinner').show()

    // Initialize game loading message
    $('#loadingMessage').html('Finding Game')
    loadingInterval = setInterval(function() {
        $('#loadingMessage').html(`Finding Game${'.'.repeat(loadingCounter++ % (numLoadingMessageDots + 1))}`)
    }, loadingMessageInterval)
}

// Cancels the game search
function cancelGameSearch() {
    // Register handler when a game search is cancelled
    socket.on('game-search-cancelled', () => {
        // Reset game loading message
        $('#spinner').hide()
        clearInterval(loadingInterval)
        loadingCounter = 0
    })

    // Emit that the game search is cancelled
    socket.emit('cancel-game-search', player)
}