$('#dump').on('click', function() {
    window.state.chemist.beaker.volume = 0
    window.state.chemist.beaker.color.red = 0
    window.state.chemist.beaker.color.yellow = 0
    window.state.chemist.beaker.color.blue = 0
    window.state.chemist.beaker.temperature = 0
    window.state.chemist.beaker.pH = 0
    sendGameState()
})

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

$('#submit').on('click', function() {
    socket.emit('player-finished', game, player)
    $('#submit').hide()
})



const VOLUME_MAX = 10







function onItemClicked(item) {
    console.log(`${item.id} clicked`)
    if (isOnIcebox || isOnHotPlate) return
    if (item.id === 'beaker') {
        console.log('emptying beaker into sink')
        window.state.chemist.beaker.volume = 0
        window.state.chemist.beaker.color.red = 0
        window.state.chemist.beaker.color.yellow = 0
        window.state.chemist.beaker.color.blue = 0
        window.state.chemist.beaker.temperature = 0
        window.state.chemist.beaker.pH = 0
    } else if (item.id === 'redCup') {
        console.log('redCup used on beaker')
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.red++
    } else if (item.id === 'yellowCup') {
        console.log('yellowCup used on beaker')
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.yellow++
    } else if (item.id === 'blueCup') {
        console.log('blueCup used on beaker')
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.blue++
    } else if (item.id === 'acidCup') {
        console.log('acidCup used on beaker')
        window.state.chemist.beaker.pH--
    } else if (item.id === 'alkalineCup') {
        console.log('alkalineCup used on beaker')
        window.state.chemist.beaker.pH++
    }

    if (window.state.chemist.beaker.volume < 0) window.state.chemist.beaker.volume = 0
    if (window.state.chemist.beaker.volume > VOLUME_MAX) window.state.chemist.beaker.volume = VOLUME_MAX
    if (window.state.chemist.beaker.temperature < 0) window.state.chemist.beaker.temperature = 0
    if (window.state.chemist.beaker.temperature > 14) window.state.chemist.beaker.temperature = 14
    if (window.state.chemist.beaker.pH < 0) window.state.chemist.beaker.pH = 0
    if (window.state.chemist.beaker.pH > 14) window.state.chemist.beaker.pH = 14

    sendGameState()
}

function init() {
    initBeaker()
    initColoredCups()
    initPHCups()
}

function draw() {
    drawBeaker(beaker)
    drawColoredCups()
    drawPHCups()
}
function initBeaker() {
    setup(beaker, 80, 120)
    beaker.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    console.log('Beaker initialized')
}

function drawBeaker(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.beginPath()

    let red = window.state.chemist.beaker.color.red
    let yellow = window.state.chemist.beaker.color.yellow
    let blue = window.state.chemist.beaker.color.blue
    
    ctx.fillStyle = ryb2hex([red, yellow, blue])
    ctx.fillRect(0, canvas.height - (window.state.chemist.beaker.volume / VOLUME_MAX * canvas.height), canvas.width, canvas.height)
}

function initColoredCups() {
    setup(redCup, 50, 50)
    redCup.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(redCup, 50, 50)
    yellowCup.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(redCup, 50, 50)
    blueCup.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    console.log('Colored cups initialized')
}

function drawColoredCups() {
    drawColoredCup(redCup, ColorType.RED)
    drawColoredCup(yellowCup, ColorType.YELLOW)
    drawColoredCup(blueCup, ColorType.BLUE)
}

function drawColoredCup(canvas, colorType = ColorType.UNKNOWN) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.beginPath()

    let red = colorType.ratio.red
    let yellow = colorType.ratio.yellow
    let blue = colorType.ratio.blue
    
    ctx.fillStyle = ryb2hex([red, yellow, blue])
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function initPHCups() {
    setup(acidCup, 50, 50)
    acidCup.addEventListener('click', function(e) {
        onItemClicked(this)
    })

    setup(alkalineCup, 50, 50)
    alkalineCup.addEventListener('click', function(e) {
        onItemClicked(this)
    })
}

function drawPHCups() {
    drawPHCup(acidCup, 'lightgreen')
    drawPHCup(alkalineCup, 'lightblue')
}

function drawPHCup(canvas, color) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = color
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

let isOnIcebox = false
let isOnHotPlate = false
let timer = 0
let temp = 0
let currentContainer = null

function allowDrop(ev) {
    ev.preventDefault()
}

function drag(ev) {
    if (currentContainer !== null) {
        if (currentContainer.id === 'beaker-container') {
            isOnIcebox = false
            isOnHotPlate = false
        }
        currentContainer = null
    }
    flag = false
    ev.dataTransfer.setData('text', ev.target.id)
}

function drop(ev) {
    ev.preventDefault()
    var data = ev.dataTransfer.getData('text')
    ev.target.appendChild(document.getElementById('beaker'))

    currentContainer = ev.target
    if (currentContainer !== null) {
        isOnIcebox = currentContainer.id === 'icebox-container'
        isOnHotPlate = currentContainer.id === 'hotplate-container'
        redraw()
        if (isOnIcebox || isOnHotPlate) {
            document.getElementById('beaker').style.bottom = '10px'
        } else {
            document.getElementById('beaker').style.bottom = '0'
        }
    }
}

function redraw() {
    //$('#test').html(`Test: ${window.state.chemist.beaker.temperature}`)
}

setInterval(function() {
    if (isOnIcebox) window.state.chemist.beaker.temperature--
    else if (isOnHotPlate) window.state.chemist.beaker.temperature++
    if (window.state.chemist.beaker.temperature < 10) window.state.chemist.beaker.temperature = 10
    if (window.state.chemist.beaker.temperature > 30) window.state.chemist.beaker.temperature = 30
    sendGameState()
    redraw()
}, 1000)
















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