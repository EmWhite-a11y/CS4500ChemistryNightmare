const wrapper = (socket) => {
    socket.on('test', () => {
        console.log(`Testing`)
    })
}

module.exports = wrapper