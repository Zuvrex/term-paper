let canvas_g = document.getElementById('graph_canvas')
let ctx_g = canvas_g.getContext('2d')
const width_g = canvas_g.width
const height_g = canvas_g.height

const graph_sz = 100
const sample_sz = 100

function draw_point(x, y) {
    ctx_g.lineTo(x, y)
}

function canvas_x(x) {
    return ind + x * (width_g - 2 * ind) / graph_sz
}

function canvas_y(y) {
    return height_g - ind - y * (height_g - 2 * ind) / graph_sz * 4
}

function draw_axes() {
    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'black'
    ctx_g.moveTo(ind, ind)
    ctx_g.lineTo(ind, height_g - ind)
    ctx_g.lineTo(width_g - ind, height_g - ind)
    ctx_g.stroke()

    ctx_g.fillStyle = 'black'
    ctx_g.font = '10px Arial'

    ctx_g.textBaseline = "top"
    ctx_g.textAlign = "center"
    for (let i = 0; i <= graph_sz; i += 10) {
        ctx_g.beginPath()
        ctx_g.fillStyle = 'black'
        ctx_g.arc(canvas_x(i), canvas_y(0), 2, 0, 2 * Math.PI)
        ctx_g.stroke()
        ctx_g.fill()

        ctx_g.fillText(i, canvas_x(i), canvas_y(0) + 5)
    }

    ctx_g.textBaseline = "middle"
    ctx_g.textAlign = "end"
    for (let i = 5; i <= graph_sz / 4; i += 5) {
        ctx_g.beginPath()
        ctx_g.fillStyle = 'black'
        ctx_g.arc(canvas_x(0), canvas_y(i), 2, 0, 2 * Math.PI)
        ctx_g.stroke()
        ctx_g.fill()

        ctx_g.fillText(i, canvas_x(0) - 5, canvas_y(i))
    }
}

function graph() {
    let x = []
    let y_b = []
    let y_u = []
    for (let i = 1; i <= graph_sz; i += 2) {
        x.push(i)
        let sum_b = 0
        let sum_u = 0
        for (let j = 0; j <= sample_sz; ++j) {
            let trees = create_schema(i)
            sum_b += trees[0].sum / trees[0].n_leafs
            sum_u += trees[1].sum / trees[1].n_leafs
        }
        y_b.push(sum_b / sample_sz)
        y_u.push(sum_u / sample_sz)
    }

    ctx_g.clearRect(0, 0, width_g, height_g)

    // ctx_g.beginPath()
    // ctx_g.lineWidth = 2
    // ctx_g.strokeStyle = 'green'
    // ctx_g.moveTo(canvas_x(0), canvas_y(0))
    // for (let i = 1; i < graph_sz; ++i) {
    //     draw_point(canvas_x(x[i]), canvas_y(x[i]))
    // }
    // ctx_g.stroke()

    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'blue'
    ctx_g.moveTo(canvas_x(0), canvas_y(0))
    for (let i = 1; i < graph_sz; ++i) {
        draw_point(canvas_x(x[i]), canvas_y(y_b[i]))
    }
    ctx_g.stroke()

    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'red'
    ctx_g.moveTo(canvas_x(0), canvas_y(0))
    for (let i = 1; i < graph_sz; ++i) {
        draw_point(canvas_x(x[i]), canvas_y(y_u[i]))
    }
    ctx_g.stroke()

    draw_axes()

    ctx_g.beginPath()
    ctx_g.fillStyle = 'white'
    ctx_g.rect(0, 0, width_g, ind - 5)
    ctx_g.fill()
}

graph()
