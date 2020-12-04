let beaker = {
    volume: 0,
    color: {
        red: 0,
        yellow: 0,
        blue: 0
    },
    temperature: 0,
    pH: 0
}

socket.on('game-state-updated', (state) => {
    window.state = state
    beaker = window.state.chemist.beaker
    log('Updated game-state')
    log(window.state)
    drawGameState()
})

$('#volume-up').on('click', function() {
    beaker.volume++
    if (beaker.volume > 10) beaker.volume = 10
    sendBeakerState()
})

$('#volume-down').on('click', function() {
    beaker.volume--
    if (beaker.volume < 0) beaker.volume = 0
    sendBeakerState()
})

$('#red-up').on('click', function() {
    beaker.color.red++
    if (beaker.color.red > 10) beaker.color.red = 10
    sendBeakerState()
})

$('#red-down').on('click', function() {
    beaker.color.red--
    if (beaker.color.red < 0) beaker.color.red = 0
    sendBeakerState()
})

$('#yellow-up').on('click', function() {
    beaker.color.yellow++
    if (beaker.color.yellow > 10) beaker.color.yellow = 10
    sendBeakerState()
})

$('#yellow-down').on('click', function() {
    beaker.color.yellow--
    if (beaker.color.yellow < 0) beaker.color.yellow = 0
    sendBeakerState()
})

$('#blue-up').on('click', function() {
    beaker.color.blue++
    if (beaker.color.blue > 10) beaker.color.blue = 10
    sendBeakerState()
})

$('#blue-down').on('click', function() {
    beaker.color.blue--
    if (beaker.color.blue < 0) beaker.color.blue = 0
    sendBeakerState()
})

$('#temperature-up').on('click', function() {
    beaker.temperature++
    if (beaker.temperature > 10) beaker.temperature = 10
    sendBeakerState()
})

$('#temperature-down').on('click', function() {
    beaker.temperature--
    if (beaker.temperature < 0) beaker.temperature = 0
    sendBeakerState()
})

$('#pH-up').on('click', function() {
    beaker.pH++
    if (beaker.pH > 10) beaker.pH = 10
    sendBeakerState()
})

$('#pH-down').on('click', function() {
    beaker.pH--
    if (beaker.pH < 0) beaker.pH = 0
    sendBeakerState()
})

function initGameState() {
    beaker = window.state.chemist.beaker
    drawGameState()
}

function drawGameState() {
    $('#volume').html(`Volume: ${beaker.volume}`)
    $('#red').html(`Red: ${beaker.color.red}`)
    $('#yellow').html(`Yellow: ${beaker.color.yellow}`)
    $('#blue').html(`Blue: ${beaker.color.blue}`)
    $('#temperature').html(`Temperature: ${beaker.temperature}`)
    $('#pH').html(`pH: ${beaker.pH}`)
}

function sendBeakerState() {
    window.state.chemist.beaker = beaker
    sendGameState()
}