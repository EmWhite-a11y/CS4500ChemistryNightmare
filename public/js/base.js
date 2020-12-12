const DEBUG = false
const player = $.cookie('player')

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

// Global handler for when a button to the home-page is clicked
$('#home').on('click', function () {
    location.href = '/' // Go to home-page
})

// Global handler for when a back button is clicked
$('#back').on('click', function () {
    history.back() // Return to previous page
})

// Logging utility
function log(str) {
    if (DEBUG) console.log(str)
}

// Execute once page is fully loaded
$(function () {
    // Hide loading-spinner
    $('#spinner').hide()
})