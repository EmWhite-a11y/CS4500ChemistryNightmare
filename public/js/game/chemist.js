const game = location.href.match(/([^\/]*)\/*$/)[1]
let count = 0

$('#writer').on('click', function() {
    socket.emit('update-count', game, ++count)
})

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

var T = 500;

function PourableContainer(id, canvas, drops) {
	this.id = id;
	this.canvas = canvas;
    this.tdrops = drops;
    this.drops = drops;

    this.volume = 0;
    this.init();
}

PourableContainer.prototype.init = function() {
	this.volume = this.getDropCount() * T;
	this.draw();
};

PourableContainer.prototype.getDropCount = function() {
	var result = 0;
    var i;
    for (i = 0; i < this.drops.length; i++) {
    	result += this.drops[i];
    }
    return result;
};

PourableContainer.prototype.use = function() {
	console.log(this.id + " used");
};

PourableContainer.prototype.empty = function() {
    this.volume -= T;
    return T;
};

PourableContainer.prototype.fill = function(volume, drops) {
	this.drops[0] += drops[0];
    this.drops[1] += drops[1];
    this.drops[2] += drops[2];
    this.volume += T;
    this.draw();
};

PourableContainer.prototype.pour = function(beaker) {
	var v = this.empty();
    this.draw();
    beaker.fill(v, this.drops);
};

PourableContainer.prototype.draw = function() {
	var ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = ryb2hex(this.drops);
    ctx.fillRect(0, this.canvas.height - this.volume / this.canvas.height, this.canvas.width, this.canvas.height);
};

var ID_BEAKER_1 = "beaker-1";
var ID_CUP_RED = "cup-red";
var ID_CUP_YELLOW = "cup-yellow";
var ID_CUP_BLUE = "cup-blue";

var canvasBeaker1 = document.getElementById(ID_BEAKER_1);
//var canvasBeaker2 = document.getElementById(ID_BEAKER_2);
var canvasCupRed = document.getElementById(ID_CUP_RED);
var canvasCupYellow = document.getElementById(ID_CUP_YELLOW);
var canvasCupBlue = document.getElementById(ID_CUP_BLUE);

var beaker1;
var cupRed, cupYellow, cupBlue;

var beakers = beaker1;
var cups = [cupRed, cupYellow, cupBlue];

canvasCupRed.addEventListener("click", onCupClicked);
canvasCupYellow.addEventListener("click", onCupClicked);
canvasCupBlue.addEventListener("click", onCupClicked);

function onCupClicked(event) {
	switch (event.srcElement.id) {
    	case ID_CUP_RED:
        	cupRed.pour(beaker1);
        	break;
        case ID_CUP_YELLOW:
        	cupYellow.pour(beaker1);
        	break;
        case ID_CUP_BLUE:
        	cupBlue.pour(beaker1);
        	break;
    }
    checkWin();
}

function reset() {
	beaker1 = new PourableContainer(ID_BEAKER_1, canvasBeaker1, [0, 0, 0]);
    //beaker2 = new PourableContainer(ID_BEAKER_2, canvasBeaker2, [0, 0, 0]);
    cupRed = new PourableContainer(ID_CUP_RED, canvasCupRed, [5, 0, 0]);
    cupYellow = new PourableContainer(ID_CUP_YELLOW, canvasCupYellow, [0, 5, 0]);
    cupBlue = new PourableContainer(ID_CUP_BLUE, canvasCupBlue, [0, 0, 5]);
}

function ryb2hex(drops) {
	var n = drops[0] + drops[1] + drops[2];
    var d0 = drops[0] / n * 0xff;
    var d1 = drops[1] / n * 0xff;
    var d2 = drops[2] / n * 0xff;
    if (n == 0) d0 = d1 = d2 = 0;
	var col = ryb2rgb([d0, d1, d2]); // Cool color: 100, 200, 150
    var r = col[0].toString(16);
    var g = col[1].toString(16);
    var b = col[2].toString(16);
    return "#"+ (
		(r.length == 1 ? "0"+ r : r) +
		(g.length == 1 ? "0"+ g : g) +
		(b.length == 1 ? "0"+ b : b)
	);
}

function checkWin() {
	var volumeMatches = beaker2.volume === beaker1.volume;
    var colorMatches = ryb2hex(beaker2.drops) === ryb2hex(beaker1.drops);
	if (volumeMatches && colorMatches) {
    	modal.style.display = "block";
    }
}

reset();