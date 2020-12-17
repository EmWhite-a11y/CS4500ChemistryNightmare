// Source: https://github.com/bahamas10/ryb/blob/gh-pages/js/RXB.js

const MAGIC_COLORS = [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0.5, 0],
    [0.163, 0.373, 0.6],
    [0.0, 0.66, 0.2],
    [0.5, 0.0, 0.5],
    [0.2, 0.094, 0.0]
]

function cubicInt(t, A, B) {
    let weight = t * t * (3 - 2 * t)
    return A + weight * (B - A)
}

function getR(iR, iY, iB, magic) {
    magic = magic || MAGIC_COLORS
    let x0 = cubicInt(iB, magic[0][0], magic[4][0])
    let x1 = cubicInt(iB, magic[1][0], magic[5][0])
    let x2 = cubicInt(iB, magic[2][0], magic[6][0])
    let x3 = cubicInt(iB, magic[3][0], magic[7][0])
    let y0 = cubicInt(iY, x0, x1)
    let y1 = cubicInt(iY, x2, x3)
    return cubicInt(iR, y0, y1)
}

function getG(iR, iY, iB, magic) {
    magic = magic || MAGIC_COLORS
    let x0 = cubicInt(iB, magic[0][1], magic[4][1])
    let x1 = cubicInt(iB, magic[1][1], magic[5][1])
    let x2 = cubicInt(iB, magic[2][1], magic[6][1])
    let x3 = cubicInt(iB, magic[3][1], magic[7][1])
    let y0 = cubicInt(iY, x0, x1)
    let y1 = cubicInt(iY, x2, x3)
    return cubicInt(iR, y0, y1)
}

function getB(iR, iY, iB, magic) {
    magic = magic || MAGIC_COLORS
    let x0 = cubicInt(iB, magic[0][2], magic[4][2])
    let x1 = cubicInt(iB, magic[1][2], magic[5][2])
    let x2 = cubicInt(iB, magic[2][2], magic[6][2])
    let x3 = cubicInt(iB, magic[3][2], magic[7][2])
    let y0 = cubicInt(iY, x0, x1)
    let y1 = cubicInt(iY, x2, x3)
    return cubicInt(iR, y0, y1)
}

function ryb2rgb(color, limit, magic) {
    limit = limit || 255
    magic = magic || MAGIC_COLORS
    let R = color[0] / limit
    let Y = color[1] / limit
    let B = color[2] / limit
    let R1 = getR(R, Y, B, magic)
    let G1 = getG(R, Y, B, magic)
    let B1 = getB(R, Y, B, magic)
    return [
        Math.ceil(R1 * limit),
        Math.ceil(G1 * limit),
        Math.ceil(B1 * limit)
    ]
}

// Input: [pint, pint, pint], Output: hex color
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