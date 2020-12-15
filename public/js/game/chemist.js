let isOnIcebox = false
let isOnHotPlate = false
let timer = 0
let temp = 0
let currentContainer = null

// Handler for when the dump button is clicked
$('#dump').on('click', function () {
    window.state.chemist.beaker.volume = 0
    window.state.chemist.beaker.color.red = 0
    window.state.chemist.beaker.color.yellow = 0
    window.state.chemist.beaker.color.blue = 0
    window.state.chemist.beaker.temperature = 0
    window.state.chemist.beaker.pH = 0
    sendGameState()
})

// Handler for when the report button is clicked
$('#submit').on('click', function () {
    socket.emit('player-finished', game, player)
    $('#submit').hide()
    disableClickableItems()
})

// Initializes game state
function initGameState() {
    init()
    drawGameState()
}

// Draw game state
function drawGameState() {
    draw()
    let seconds = window.state.time % 60
    let minutes = Math.trunc(window.state.time / 60)
    if (seconds < 10) seconds = `0${seconds}`
    if (minutes < 10) minutes = `0${minutes}`
    $('#time').html(`Time: ${minutes}:${seconds}`)
}

// Handler for when an item is clicked
function onItemClicked(item) {
    log(`${item.id} clicked`)
    if (isOnIcebox || isOnHotPlate) return
    if (item.id === 'beaker') {
        window.state.chemist.beaker.volume = 0
        window.state.chemist.beaker.color.red = 0
        window.state.chemist.beaker.color.yellow = 0
        window.state.chemist.beaker.color.blue = 0
        window.state.chemist.beaker.temperature = 0
        window.state.chemist.beaker.pH = 0
    } else if (item.id === 'redCup') {
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.red++
    } else if (item.id === 'yellowCup') {
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.yellow++
    } else if (item.id === 'blueCup') {
        window.state.chemist.beaker.volume++
        window.state.chemist.beaker.color.blue++
    } else if (item.id === 'acidCup') {
        window.state.chemist.beaker.pH--
    } else if (item.id === 'alkalineCup') {
        window.state.chemist.beaker.pH++
    }

    // Constrain beaker properties
    if (window.state.chemist.beaker.volume < 0) window.state.chemist.beaker.volume = 0
    if (window.state.chemist.beaker.volume > VOLUME_MAX) window.state.chemist.beaker.volume = VOLUME_MAX
    if (window.state.chemist.beaker.temperature < 0) window.state.chemist.beaker.temperature = 0
    if (window.state.chemist.beaker.temperature > 14) window.state.chemist.beaker.temperature = 14
    if (window.state.chemist.beaker.pH < 0) window.state.chemist.beaker.pH = 0
    if (window.state.chemist.beaker.pH > 14) window.state.chemist.beaker.pH = 14

    // Notify the server of changes
    sendGameState()
}

// Initializes game items
function init() {
    initBeaker()
    initColoredCups()
    initPHCups()
}

// Draws game items
function draw() {
    drawBeaker(beaker)
    drawColoredCups()
    drawPHCups()
}

function initBeaker() {
    setup(beaker, 80, 120)
    beaker.addEventListener('click', function (e) {
        onItemClicked(this)
    })
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
    redCup.addEventListener('click', function (e) {
        onItemClicked(this)
    })

    setup(yellowCup, 50, 50)
    yellowCup.addEventListener('click', function (e) {
        onItemClicked(this)
    })

    setup(blueCup, 50, 50)
    blueCup.addEventListener('click', function (e) {
        onItemClicked(this)
    })
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
    setup(acidCup, 75, 87)
    acidCup.addEventListener('click', function (e) {
        onItemClicked(this)
    })

    setup(alkalineCup, 75, 87)
    alkalineCup.addEventListener('click', function (e) {
        onItemClicked(this)
    })
}

function drawPHCups() {
    drawPHCup(acidCup, document.getElementById('acidCupImg'))
    drawPHCup(alkalineCup, document.getElementById('alkalineCupImg'))
}

function drawPHCup(canvas, img) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
}

// Initializes a canvas's size
function setup(canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
}

// Prevents default drop action on draggable items
function allowDrop(ev) {
    ev.preventDefault()
}

// Handler for when a draggable item is dragged
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

// Handler for when a draggable item is dropped
function drop(ev) {
    ev.preventDefault()
    ev.target.appendChild(document.getElementById('beaker'))

    currentContainer = ev.target
    if (currentContainer !== null) {
        isOnIcebox = currentContainer.id === 'icebox-container'
        isOnHotPlate = currentContainer.id === 'hotplate-container'
        if (isOnIcebox || isOnHotPlate) {
            document.getElementById('beaker').style.bottom = '10px'
        } else {
            document.getElementById('beaker').style.bottom = '0'
        }
    }
}

// Handler for when the beaker is on the icebox or hotplate
setInterval(function () {
    if (isOnIcebox) window.state.chemist.beaker.temperature--
    else if (isOnHotPlate) window.state.chemist.beaker.temperature++
    if (window.state.chemist.beaker.temperature < 10) window.state.chemist.beaker.temperature = 10
    if (window.state.chemist.beaker.temperature > 30) window.state.chemist.beaker.temperature = 30
    sendGameState()
}, 1000)

// Disables all clickable objects when Chemist clicks turn-in button
function disableClickableItems() {
    document.getElementById('redCup').style.pointerEvents = 'none';
    document.getElementById('yellowCup').style.pointerEvents = 'none';
    document.getElementById('blueCup').style.pointerEvents = 'none';
    document.getElementById('acidCup').style.pointerEvents = 'none';
    document.getElementById('alkalineCup').style.pointerEvents = 'none';
    document.getElementById('beaker').style.pointerEvents = 'none';
}