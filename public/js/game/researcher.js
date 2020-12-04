socket.on('game-state-updated', (state) => {
    window.state = state
    log('Updated game-state')
    log(window.state)
    drawGameState()
})

function initGameState() {
    drawGameState()
}

function drawGameState() {
    $('#researcher-volume').html(`Volume: ${window.state.researcher.beaker.volume}`)
    $('#researcher-red').html(`Red: ${window.state.researcher.beaker.color.red}`)
    $('#researcher-yellow').html(`Yellow: ${window.state.researcher.beaker.color.yellow}`)
    $('#researcher-blue').html(`Blue: ${window.state.researcher.beaker.color.blue}`)
    $('#researcher-temperature').html(`Temperature: ${window.state.researcher.beaker.temperature}`)
    $('#researcher-pH').html(`pH: ${window.state.researcher.beaker.pH}`)

    $('#chemist-volume').html(`Volume: ${window.state.chemist.beaker.volume}`)
    $('#chemist-red').html(`Red: ${window.state.chemist.beaker.color.red}`)
    $('#chemist-yellow').html(`Yellow: ${window.state.chemist.beaker.color.yellow}`)
    $('#chemist-blue').html(`Blue: ${window.state.chemist.beaker.color.blue}`)
    $('#chemist-temperature').html(`Temperature: ${window.state.chemist.beaker.temperature}`)
    $('#chemist-pH').html(`pH: ${window.state.chemist.beaker.pH}`)
}