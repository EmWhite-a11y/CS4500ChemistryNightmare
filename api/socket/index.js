const bootstrap = (io) => {
    io.on('connection', (socket) => {
        console.log(`User ${socket.id} connected`)

        require('./home')(socket)
        require('./game')(socket)

        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected`)
        })
    })
}

module.exports = bootstrap