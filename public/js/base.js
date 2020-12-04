const DEBUG = false

const GameStatus = {
    WAITING: 0,
    READY: 1,
    STARTED: 2,
    WON: 3,
    LOST: 4
}

const PlayerRole = {
    UNKNOWN: 0,
    CHEMIST: 1,
    RESEARCHER: 2
}

const player = $.cookie('player')

$('#back').on('click', function() {
    history.back()
})

$('#home').on('click', function() {
    location.href = '/'
})

$(function() {
    $('#spinner').hide()
})

function log(str) {
    if (DEBUG) {
        console.log(str)
    }
}