let count = 0

$('#writer').on('click', function() {
    socket.emit('update-count', game, ++count)
})