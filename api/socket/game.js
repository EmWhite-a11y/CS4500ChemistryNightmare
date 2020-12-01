const wrapper = (socket) => {
    socket.on('update-beaker', data => {
        consele.log('beaker updated')
    })

    socket.on('call-user', data => {
        console.log(`${socket.id} calling user ${data.to}`)
        socket.to(data.to).emit('call-made', {
            offer: data.offer,
            socket: socket.id
        })
    })

    socket.on('make-answer', data => {
        console.log(`${socket.id} making answer ${data.to}`)
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        })
    })

    socket.on('reject-call', data => {
        console.log(`${socket.id} rejecting call ${data.from}`)
        socket.to(data.from).emit('call-rejected', {
            socket: socket.id
        })
    })
}

module.exports = wrapper