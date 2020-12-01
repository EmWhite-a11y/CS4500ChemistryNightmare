socket.on('count-updated', (count) => {
    $('#reader').html(count)
})