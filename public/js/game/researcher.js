function initGameState() {
    init()
    drawGameState()
}

function drawGameState() {
    draw()
    let seconds = window.state.time % 60
    let minutes = Math.trunc(window.state.time / 60)
    if (seconds < 10) seconds = `0${seconds}`
    if (minutes < 10) minutes = `0${minutes}`
    $('#time').html(`Time: ${minutes}:${seconds}`)
}

let activeBeaker = null
let timeout = null

$('#researcherBeaker').on('click', function() {
    activeBeaker = this.id
})

$('#chemistBeaker').on('click', function() {
    activeBeaker = this.id
})

$('#ruler').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`Volume: ${window.state.researcher.beaker.volume}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`Volume: ${window.state.chemist.beaker.volume}`)
    showInfo()
    activeBeaker = null
})

$('#thermometer').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`Temperature: ${window.state.researcher.beaker.temperature}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`Temperature: ${window.state.chemist.beaker.temperature}`)
    showInfo()
    activeBeaker = null
})

$('#phMeter').on('click', function() {
    if (activeBeaker === null) return
    if (activeBeaker === 'researcherBeaker') $('#info').html(`pH: ${window.state.researcher.beaker.pH}`)
    else if (activeBeaker === 'chemistBeaker') $('#info').html(`pH: ${window.state.chemist.beaker.pH}`)
    showInfo()
    activeBeaker = null
})

function showInfo() {
    console.log('showing info')
    $('#info').show()
    setTimeout(function() {
        console.log('hiding info')
        $('#info').hide()
    }, 2 * 1000)
}

//$('#read-researcher').on('click', function() {
//    displayBeaker(window.state.researcher.beaker)
//})

//$('#read-chemist').on('click', function() {
//    displayBeaker(window.state.chemist.beaker)
//})

function displayBeaker(beaker) {
    console.log('Displaying beaker')
    console.log(beaker)
}


const VOLUME_MAX = 10



function onItemClicked(item) {
    console.log(`${item.id} clicked`)
}

function init() {
    $('#info').hide()
    
    initBeakers()
    initTools()

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
    drawTools()
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
    
    console.log('Beakers initialized')
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

    console.log('Tools initialized')
}

function drawTools() {
    drawRuler(ruler)
    drawThermometer(thermometer)
    drawPHMeter(phMeter)
}

function drawRuler(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = '#deb887'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawThermometer(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = 'rgba(0.5, 0.5, 0.5, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawPHMeter(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = '#333'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function setup(canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
}

class ColorType {
    static UNKNOWN = new ColorType('Unknown', { red: 0, yellow: 0, blue: 0 })
    // Primary colors
    static RED = new ColorType('Red', { red: 1, yellow: 0, blue: 0 })
    static YELLOW = new ColorType('Yellow', { red: 0, yellow: 1, blue: 0 })
    static BLUE = new ColorType('Blue', { red: 0, yellow: 0, blue: 1 })
    // Secondary colors
    static ORANGE = new ColorType('Red', { red: 1, yellow: 1, blue: 0 })
    static GREEN = new ColorType('Yellow', { red: 0, yellow: 1, blue: 1 })
    static VIOLET = new ColorType('Blue', { red: 1, yellow: 0, blue: 1 })
    // Tertiary colors
    static YELLOW_ORANGE = new ColorType('Red', { red: 1, yellow: 2, blue: 0 })
    static RED_ORANGE = new ColorType('Yellow', { red: 2, yellow: 1, blue: 0 })
    static RED_VIOLET = new ColorType('Blue', { red: 2, yellow: 0, blue: 1 })
    static BLUE_VIOLET = new ColorType('Red', { red: 1, yellow: 0, blue: 2 })
    static BLUE_GREEN = new ColorType('Yellow', { red: 0, yellow: 1, blue: 2 })
    static YELLOW_GREEN = new ColorType('Blue', { red: 0, yellow: 2, blue: 1 })

    constructor(name, ratio) {
        this.name = name
        this.ratio = ratio
    }
}














var MAGIC_COLORS = [
	[1,     1,     1],
	[1,     1,     0],
	[1,     0,     0],
	[1,     0.5,   0],
	[0.163, 0.373, 0.6],
	[0.0,   0.66,  0.2],
    [0.5,   0.0,   0.5],
    [0.2,   0.094, 0.0]
];

function cubicInt(t, A, B){
	var weight = t * t * (3 - 2 * t);
	return A + weight * (B - A);
}

function getR(iR, iY, iB, magic) {
	magic = magic || MAGIC_COLORS;
	// red
	var x0 = cubicInt(iB, magic[0][0], magic[4][0]);
	var x1 = cubicInt(iB, magic[1][0], magic[5][0]);
    var x2 = cubicInt(iB, magic[2][0], magic[6][0]);
    var x3 = cubicInt(iB, magic[3][0], magic[7][0]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

function getG(iR, iY, iB, magic) {
	magic = magic || MAGIC_COLORS;
    // green
    var x0 = cubicInt(iB, magic[0][1], magic[4][1]);
    var x1 = cubicInt(iB, magic[1][1], magic[5][1]);
    var x2 = cubicInt(iB, magic[2][1], magic[6][1]);
    var x3 = cubicInt(iB, magic[3][1], magic[7][1]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

function getB(iR, iY, iB, magic) {
	magic = magic || MAGIC_COLORS;
	// blue
	var x0 = cubicInt(iB, magic[0][2], magic[4][2]);
    var x1 = cubicInt(iB, magic[1][2], magic[5][2]);
    var x2 = cubicInt(iB, magic[2][2], magic[6][2]);
    var x3 = cubicInt(iB, magic[3][2], magic[7][2]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

function ryb2rgb(color, limit, magic) {
	limit = limit || 255;
    magic = magic || MAGIC_COLORS;
    var R = color[0] / limit;
    var Y = color[1] / limit;
    var B = color[2] / limit;
    var R1 = getR(R, Y, B, magic);
    var G1 = getG(R, Y, B, magic);
    var B1 = getB(R, Y, B, magic);
    return [
		Math.ceil(R1 * limit),
		Math.ceil(G1 * limit),
		Math.ceil(B1 * limit)
	];
}

function ryb2hex(drops) {
	let n = drops[0] + drops[1] + drops[2]
    let d0 = drops[0] / n * 0xff
    let d1 = drops[1] / n * 0xff
    let d2 = drops[2] / n * 0xff
    if (n == 0) d0 = d1 = d2 = 0
	let col = ryb2rgb([d0, d1, d2])
    let r = col[0].toString(16)
    let g = col[1].toString(16)
    let b = col[2].toString(16)
    return '#' + (
		(r.length == 1 ? '0' + r : r) +
		(g.length == 1 ? '0' + g : g) +
		(b.length == 1 ? '0' + b : b)
	)
}





let report = {
    ratio: {
        red: 0,
        yellow: 0,
        blue: 0
    },
    temperature: 0,
    ph: 0
}

let submitted = false

$('#reportModal').on('hide.bs.modal', function() {
    console.log('hide modal')

    report.volume = parseInt($('#report-volume').val()) || 0
    report.ratio.red = parseInt($('#report-red-ratio').val()) || 0
    report.ratio.yellow = parseInt($('#report-yellow-ratio').val()) || 0
    report.ratio.blue = parseInt($('#report-blue-ratio').val()) || 0
    report.temperature = parseInt($('#report-temperature').val()) || 0
    report.ph = parseInt($('#report-ph').val()) || 0

    console.log(report)

    if (submitted) {
        $('#report-button').hide()
        socket.emit('submit-report', game, report)
        socket.emit('player-finished', game, player)
    }
})

$('#report-submit').on('click', function() {
    submitted = true
    console.log('report submitted')
})