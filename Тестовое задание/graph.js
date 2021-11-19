let canvas = document.getElementById('c1')
let ctx = canvas.getContext('2d')

const width = canvas.width
const height = canvas.height
const scale = 10


const drawGrid = function(w, h) {
    ctx.canvas.width  = w
    ctx.canvas.height = h
    ctx.strokeStyle = 'grey'
    for (let x = 0; x <= w; x += width / (scale * 2)) {
        for (let y = 0; y <= h; y += height / (scale * 2)) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, h)
            ctx.stroke()
            ctx.moveTo(0, y)
            ctx.lineTo(w, y)
            ctx.stroke()
        }
    }
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
};


function xOnPlane(x) {
    return (x - width / 2) / width * (scale * 2)
}

function yOnPlane(y) {
    return -(y - height / 2) / height * (scale * 2)
}

function xOnCanvas(x) {
    return x * width / (scale * 2) + width / 2
}

function yOnCanvas(y) {
    return -y * height / (scale * 2) + height / 2
}


const parabola = {
    setCoeffs(a, b, c) {
        this.a = a
        this.b = b
        this.c = c
        return this
    },

    getValue(x) {
        return this.a * x**2 + this.b * x + this.c
    }
}

function findCoefs(x1, y1, x2, y2, x3, y3) {
    x1 = xOnPlane(x1); y1 = yOnPlane(y1)
    x2 = xOnPlane(x2); y2 = yOnPlane(y2)
    x3 = xOnPlane(x3); y3 = yOnPlane(y3)
    const a = (y3 - (x3 * (y2 - y1) + x2 * y1 - x1 * y2) / (x2 - x1)) / (x3 * (x3 - x1 - x2) + x1 * x2)
    const b = (y2 - y1) / (x2 - x1) - a * (x1 + x2)
    const c = (x2 * y1 - x1 * y2) / (x2 - x1) + a * x1 * x2
    return {a: a, b: b, c: c}
}

function draw(f) {
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = '3'
    ctx.moveTo(-10, -10)
    for (let i = -10; i < width + 10; ++i)
        ctx.lineTo(i, yOnCanvas(f.getValue(xOnPlane(i))))
    ctx.lineCap = 'round'
    ctx.stroke()
    document.getElementById('a').placeholder = graph.a
    document.getElementById('b').placeholder = graph.b
    document.getElementById('c').placeholder = graph.c
}

const graph = parabola.setCoeffs(0, 0, 0)

let num = 3
let points = []

function start() {
    ctx.clearRect(0, 0, width, height)

    drawGrid(width, height)

    canvas.onmousedown = function (event) {
        if (num === 3) {
            ctx.clearRect(0, 0, width, height)
            drawGrid(width, height)
        }
        if (num !== 0) {
            ctx.beginPath()
            const x = event.offsetX
            const y = event.offsetY
            ctx.arc(x, y, 5, 0, 2 * Math.PI)
            ctx.fillStyle = 'green'
            ctx.fill()
            points.push({x: x, y: y})
            --num
        }
        if (num === 0) {
            coefs = findCoefs(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y)
            graph.setCoeffs(coefs.a, coefs.b, coefs.c)
            draw(graph)
            console.log(coefs)
            // num = 3
            points = []
        }
    }
}

function change(val, coef) {
    ctx.clearRect(0, 0, width, height)
    drawGrid(width, height)

    graph[coef] = +val.value
    draw(graph)
    console.log(graph.a, graph.b, graph.c)
}

start()
