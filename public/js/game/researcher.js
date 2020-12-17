let activeBeaker = null
let timeout = null
let reportSubmitted = false
let report = {
    ratio: {
        red: 0,
        yellow: 0,
        blue: 0
    },
    temperature: 0,
    ph: 0
}

// Initializes game state
function initGameState() {
    init()
    drawGameState()
}

// Draws game state
function drawGameState() {
    draw()
    let seconds = window.state.time % 60
    let minutes = Math.trunc(window.state.time / 60)
    if (seconds < 10) seconds = `0${seconds}`
    if (minutes < 10) minutes = `0${minutes}`
    $('#time').html(`Time: ${minutes}:${seconds}`)
}

// Handler for when the researcher's beaker is clicked
$('#researcherBeaker').on('click', function() {
    activeBeaker = this.id
})

// Handler for when the chemist's beaker is clicked
$('#chemistBeaker').on('click', function() {
    activeBeaker = this.id
})

// Handler for when the ruler is clicked
$('#ruler').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`Volume: ${window.state.researcher.beaker.volume}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`Volume: ${window.state.chemist.beaker.volume}`)
    showInfo()
    activeBeaker = null
})

// Handler for when the thermometer is clicked
$('#thermometer').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`Temperature: ${window.state.researcher.beaker.temperature}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`Temperature: ${window.state.chemist.beaker.temperature}`)
    showInfo()
    activeBeaker = null
})

// Handler for when the pH meter is clicked
$('#phMeter').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`pH: ${window.state.researcher.beaker.pH}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`pH: ${window.state.chemist.beaker.pH}`)
    showInfo()
    activeBeaker = null
})

// Handler for when beaker info is to be displayed
function showInfo() {
    $('#info').show()
    setTimeout(function() {
        $('#info').hide()
    }, 2 * 1000)
}

// Handler for when an item is clicked
function onItemClicked(item) {
    log(`${item.id} clicked`)
}

function init() {
    $('#info').hide()
    
    initBeakers()
    initTools()

    // InitialSize color palette
    $('#red').css('background-color', ryb2hex([1, 0, 0]))
    $('#yellow').css('background-color', ryb2hex([0, 1, 0]))
    $('#blue').css('background-color', ryb2hex([0, 0, 1]))
    $('#orange').css('background-color', ryb2hex([1, 1, 0]))
    $('#green').css('background-color', ryb2hex([0, 1, 1]))
    $('#violet').css('background-color', ryb2hex([1, 0, 1]))
    $('#yellow-orange').css('background-color', ryb2hex([1, 2, 0]))
    $('#red-orange').css('background-color', ryb2hex([2, 1, 0]))
    $('#red-violet').css('background-color', ryb2hex([2, 0, 1]))
    $('#blue-violet').css('background-color', ryb2hex([1, 0, 2]))
    $('#blue-green').css('background-color', ryb2hex([0, 1, 2]))
    $('#yellow-green').css('background-color', ryb2hex([0, 2, 1]))
    $('[data-toggle="tooltip"]').tooltip()
}

function draw() {
    drawBeakers()
}

function initBeakers() {
    setup(researcherBeaker, 80, 120)
    researcherBeaker.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(chemistBeaker, 80, 120)
    chemistBeaker.addEventListener('click', function(e) {
        onItemClicked(this)
    })
}

function drawBeakers() {
    drawResearcherBeaker(researcherBeaker)
    drawChemistBeaker(chemistBeaker)
}

function drawResearcherBeaker(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.beginPath()

    let red = window.state.researcher.beaker.color.red
    let yellow = window.state.researcher.beaker.color.yellow
    let blue = window.state.researcher.beaker.color.blue
    
    ctx.fillStyle = ryb2hex([red, yellow, blue])
    ctx.fillRect(0, canvas.height - (window.state.researcher.beaker.volume / VOLUME_MAX * canvas.height), canvas.width, canvas.height)
}

function drawChemistBeaker(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.beginPath()

    let red = window.state.chemist.beaker.color.red
    let yellow = window.state.chemist.beaker.color.yellow
    let blue = window.state.chemist.beaker.color.blue
    
    ctx.fillStyle = ryb2hex([red, yellow, blue])
    ctx.fillRect(0, canvas.height - (window.state.chemist.beaker.volume / VOLUME_MAX * canvas.height), canvas.width, canvas.height)
}

function initTools() {
    setup(ruler, 20, 50)
    ruler.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(thermometer, 10, 50)
    thermometer.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(phMeter, 40, 50)
    phMeter.addEventListener('click', function(e) {
        onItemClicked(this)
    })
}

// Initializes a canvas's size
function setup(canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
}

// Handler for when the report is to be closed
$('#reportModal').on('hide.bs.modal', function() {
    report.volume = parseInt($('#report-volume').val()) || 0
    report.ratio.red = parseInt($('#report-red-ratio').val()) || 0
    report.ratio.yellow = parseInt($('#report-yellow-ratio').val()) || 0
    report.ratio.blue = parseInt($('#report-blue-ratio').val()) || 0
    report.temperature = parseInt($('#report-temperature').val()) || 0
    report.ph = parseInt($('#report-ph').val()) || 0
    if (reportSubmitted) {
        $('#report-button').hide()
        socket.emit('submit-report', game, report)
        socket.emit('player-finished', game, player)
    }
})

// Handler for when the report is submitted
$('#report-submit').on('click', function() {
    reportSubmitted = true
})