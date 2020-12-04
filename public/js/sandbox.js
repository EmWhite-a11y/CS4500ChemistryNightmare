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

//let color = ryb2hex([0, 1, 2]) //'#ff00ff'
//$('#square').css('background-color', color)

let counter = 0
const colors = [
    'Red',
    'Yellow',
    'Blue',
    'Orange',
    'Green',
    'Violet',
    'Yellow-Orange',
    'Red-Orange',
    'Red-Violet',
    'Blue-Violet',
    'Blue-Green',
    'Yellow-Green'
]

setInterval(function () {
    let red = 0
    let yellow = 0
    let blue = 0

    // Primary colors (3)
    // red, yellow, blue
    // Secondary colors (3)
    // orange, green, violet (purple)
    // Tertiary colors (6)
    // yellow-orange, red-orange, red-violet, blue-violet, blue-green, yellow-green
    // Total: 12 unique colors

    // Unique min ratio combinations with max 3
    // 0: 100 200 300 (red)
    // 1: 010 020 030 (yellow)
    // 2: 001 002 003 (blue)
    // 3: 110 (orange)
    // 4: 011 (green)
    // 5: 101 (violet)
    // 6: 120 (yellow-orange)
    // 7: 210 (red-orange)
    // 8: 201 (red-violet)
    // 9: 102 (blue-violet)
    // 10: 012 (blue-green)
    // 11: 021 (yellow-green)
    
    switch (counter) {
        case 0: red = 1; yellow = 0; blue = 0; break    // red
        case 1: red = 0; yellow = 1; blue = 0; break    // yellow
        case 2: red = 0; yellow = 0; blue = 1; break    // blue
        case 3: red = 1; yellow = 1; blue = 0; break    // orange
        case 4: red = 0; yellow = 1; blue = 1; break    // green
        case 5: red = 1; yellow = 0; blue = 1; break    // violet
        case 6: red = 1; yellow = 2; blue = 0; break    // yellow-orange
        case 7: red = 2; yellow = 1; blue = 0; break    // red-orange
        case 8: red = 2; yellow = 0; blue = 1; break    // red-violet
        case 9: red = 1; yellow = 0; blue = 2; break    // blue-violet
        case 10: red = 0; yellow = 1; blue = 2; break   // blue-green
        case 11: red = 0; yellow = 2; blue = 1; break   // yellow-green
    }

    let color = ryb2hex([red, yellow, blue])
    
    $('#test-square').css('background-color', color)
    $('#test-color-title').html(colors[counter])
    $('#test-color-description').html(`Red: ${red}, Yellow: ${yellow}, Blue: ${blue}`)

    counter++
    counter %= 12
}, 1000)

function setColorPaletteColor(name, color) {
    $(`#color-${name}`).css('background-color', color)
}

$(function() {
    setColorPaletteColor('red', ryb2hex([1, 0, 0]))
    setColorPaletteColor('yellow', ryb2hex([0, 1, 0]))
    setColorPaletteColor('blue', ryb2hex([0, 0, 1]))

    setColorPaletteColor('orange', ryb2hex([1, 1, 0]))
    setColorPaletteColor('green', ryb2hex([0, 1, 1]))
    setColorPaletteColor('violet', ryb2hex([1, 0, 1]))

    setColorPaletteColor('yellow-orange', ryb2hex([1, 2, 0]))
    setColorPaletteColor('red-orange', ryb2hex([2, 1, 0]))
    setColorPaletteColor('red-violet', ryb2hex([2, 0, 1]))
    setColorPaletteColor('blue-violet', ryb2hex([1, 0, 2]))
    setColorPaletteColor('blue-green', ryb2hex([0, 1, 2]))
    setColorPaletteColor('yellow-green', ryb2hex([0, 2, 1]))
})