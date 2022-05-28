let canvas_g = document.getElementById('graph_canvas')
let ctx_g = canvas_g.getContext('2d')
const width_g = canvas_g.width
const height_g = canvas_g.height

const ind_l = 20
const ind_r = 0
const ind_t = 0
const ind_b = 20

const graph_sz = 100
const sample_sz = 100

function draw_point(x, y) {
    ctx_g.lineTo(x, y)
}

function canvas_x(x) {
    return ind + ind_l + x * (width_g - 2 * ind - ind_l) / graph_sz
}

function canvas_y(y) {
    return height_g - ind - ind_b - y * (height_g - 2 * ind - ind_b) / graph_sz * 5
}

function draw_axes() {
    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'black'
    ctx_g.moveTo(ind + ind_l, ind)
    ctx_g.lineTo(ind + ind_l, height_g - ind - ind_b)
    ctx_g.lineTo(width_g - ind, height_g - ind - ind_b)
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

    ctx_g.font = '15px Arial'
    ctx_g.textBaseline = "top"
    ctx_g.textAlign = "center"
    ctx_g.fillText('number of elements', width_g / 2 + ind, height_g - ind)
    ctx_g.rotate(-Math.PI / 2)
    ctx_g.fillText('mean depth', -height_g / 2 + ind, 5)
    ctx_g.rotate(Math.PI / 2)

    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'black'
    ctx_g.fillStyle = 'white'
    ctx_g.rect(width_g - 120, ind - 5, 100, 2 * ind)
    ctx_g.stroke()
    ctx_g.fill()


    ctx_g.fillStyle = 'black'
    ctx_g.font = '12px Arial'
    ctx_g.textAlign = "start"
    ctx_g.fillText('unbalanced', width_g - 90, ind)
    ctx_g.fillText('AVL', width_g - 90, 2 * ind)
    ctx_g.lineWidth = 2
    ctx_g.beginPath()
    ctx_g.strokeStyle = 'blue'
    ctx_g.moveTo(width_g - 95, ind + 5)
    ctx_g.lineTo(width_g - 110, ind + 5)
    ctx_g.stroke()
    ctx_g.beginPath()
    ctx_g.strokeStyle = 'red'
    ctx_g.moveTo(width_g - 95, 2 * ind + 5)
    ctx_g.lineTo(width_g - 110, 2 * ind + 5)
    ctx_g.stroke()
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
    ctx_g.strokeStyle = 'red'
    ctx_g.moveTo(canvas_x(0), canvas_y(0))
    for (let i = 1; i < graph_sz; ++i) {
        draw_point(canvas_x(x[i]), canvas_y(y_b[i]))
    }
    ctx_g.stroke()

    ctx_g.beginPath()
    ctx_g.lineWidth = 2
    ctx_g.strokeStyle = 'blue'
    ctx_g.moveTo(canvas_x(0), canvas_y(0))
    for (let i = 1; i < graph_sz; ++i) {
        draw_point(canvas_x(x[i]), canvas_y(y_u[i]))
    }
    ctx_g.stroke()

    ctx_g.beginPath()
    ctx_g.fillStyle = 'white'
    ctx_g.rect(0, 0, width_g, ind)
    ctx_g.fill()

    draw_axes()
}

graph()
