let sch_b = document.getElementById('canvas_b')
let ctx_b = sch_b.getContext('2d')
const width_b = sch_b.width
const height_b = sch_b.height

let sch_u = document.getElementById('canvas_u')
let ctx_u = sch_u.getContext('2d')
const width_u = sch_u.width
const height_u = sch_u.height

const ind = 20


class Node_scheme {
    constructor(value, parent, left, right, side) {
        this.value = value
        this.parent = parent
        this.left = left
        this.right = right
        this.depth = 0
        this.side = side
        this.x = 0
        this.y = 0
    }
}


class Tree_scheme {
    #max_x = 0
    #max_y = 0
    #colour = 'black'
    constructor(colour='black') {
        this.size = 0
        this.root = new Node_scheme(null, null, null, null, null)
        this.n_leafs = 0
        this.sum = 0
        this.#colour = colour
    }

    count_depth(node) {
        node.depth = Math.max(node.left.depth, node.right.depth) + 1
    }

    coords(node=this.root, x =0, y=0) {
        if (node.value === null) {
            return x
        }
        if (node.left.value === null && node.right.value === null) {
            this.n_leafs += 1
            this.sum += y + 1
        }
        node.x = this.coords(node.left, x, y + 1)
        node.y = y
        if (node.x > this.#max_x) {
            this.#max_x = node.x
        }
        if (node.y > this.#max_y) {
            this.#max_y = node.y
        }
        return this.coords(node.right, node.x + 1, y + 1)
    }

    draw(context, w, h, node=this.root) {
        if (node.value === null) {
            return
        }
        this.draw(context, w, h, node.left)
        this.draw(context, w, h, node.right)
        context.beginPath()
        context.lineWidth = 4 / Math.log2(this.size)
        context.fillStyle = this.#colour
        context.arc(ind + node.x * (w - 2 * ind) / this.#max_x, ind + 5 + node.y * (h - 2 * ind) / this.#max_y, context.lineWidth, 0, 2 * Math.PI)
        context.stroke()
        context.fill()
        if (node.parent !== null) {
            context.beginPath()
            context.strokeStyle = this.#colour
            context.moveTo(ind + node.x * (w - 2 * ind) / this.#max_x, ind + 5 + node.y * (h - 2 * ind) / this.#max_y)
            context.lineTo(ind + node.parent.x * (w - 2 * ind) / this.#max_x, ind + 5 + node.parent.y * (h - 2 * ind) / this.#max_y)
            context.stroke()
        }
    }
}


class Balanced extends Tree_scheme {
    #left_rotation(node) {
        if (node.parent !== null) {
            if (node.side < 0) {
                node.parent.left = node.right
                node.right.side = -1
            } else {
                node.parent.right = node.right
                node.right.side = 1
            }
        }
        node.side = -1
        node.right.left.side = 1
        node.right.parent = node.parent
        node.right.left.parent = node
        node.parent = node.right
        node.right = node.parent.left
        node.parent.left = node
        if (this.root.parent !== null) {
            this.root = this.root.parent
        }

        this.count_depth(node)
    }

    #right_rotation(node) {
        if (node.parent !== null) {
            if (node.side < 0) {
                node.parent.left = node.left
                node.left.side = -1
            } else {
                node.parent.right = node.left
                node.left.side = 1
            }
        }
        node.side = 1
        node.left.right.side = -1
        node.left.parent = node.parent
        node.left.right.parent = node
        node.parent = node.left
        node.left = node.parent.right
        node.parent.right = node
        if (this.root.parent !== null) {
            this.root = this.root.parent
        }

        this.count_depth(node)
    }

    #big_left_rotation(node) {
        this.#right_rotation(node.right)
        this.#left_rotation(node)
    }

    #big_right_rotation(node) {
        this.#left_rotation(node.left)
        this.#right_rotation(node)
    }

    #balancing(node) {
        if (node.right.depth - node.left.depth > 1 && node.right.left.depth > node.right.right.depth) {
            this.#big_left_rotation(node)
        } else if (node.right.depth - node.left.depth > 1) {
            this.#left_rotation(node)
        } else if (node.left.depth - node.right.depth > 1 && node.left.right.depth > node.left.left.depth) {
            this.#big_right_rotation(node)
        } else if (node.left.depth - node.right.depth > 1) {
            this.#right_rotation(node)
        } else {
            this.count_depth(node)
        }
    }

    insert(value, obj=this) {
        let node = obj.root
        while (node.value !== null) {
            if (node.value > value) {
                node = node.left
            } else if (node.value < value) {
                node = node.right
            } else {
                return
            }
        }

        node.value = value
        node.left = new Node(null, node, null, null, -1)
        node.right = new Node(null, node, null, null, 1)
        obj.size += 1

        while (node !== null) {
            obj.#balancing(node)
            node = node.parent
        }
    }
}


class Unbalanced extends Tree_scheme {
    insert(value) {
        let node = this.root
        while (node.value !== null) {
            if (node.value > value) {
                node = node.left
            } else if (node.value < value) {
                node = node.right
            } else {
                return
            }
        }

        node.value = value
        node.left = new Node_scheme(null, node, null, null, -1)
        node.right = new Node_scheme(null, node, null, null, 1)
        this.size += 1

        while (node !== null) {
            this.count_depth(node)
            node = node.parent
        }
    }
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
}

function permutations(array, n) {
    for (let i = 0; i < n; ++i) {
        let j = Math.floor(Math.random() * (array.length + 1))
        let k = Math.floor(Math.random() * (array.length + 1));
        [array[k], array[j]] = [array[j], array[k]]
    }
}


function create_scheme(num=null) {
    if (num === null) {
        num = document.getElementById('n_node').value
    }
    let n_perm = document.getElementById('n_perm').value

    let array = Array.from(Array(parseInt(num)).keys())
    if (n_perm !== '') {
        permutations(array, n_perm)
    } else {
        shuffle(array)
    }

    let tree_b = new Balanced('red')
    let tree_u = new Unbalanced('blue')

    for (let val of array) {
        tree_b.insert(val)
        tree_u.insert(val)
    }
    tree_b.coords()
    tree_u.coords()

    return [tree_b, tree_u]
}

function draw_schemes() {
    graph()

    ctx_b.clearRect(0, 0, width_b, height_b)
    ctx_u.clearRect(0, 0, width_u, height_u)

    ctx_b.fillStyle = 'black'
    ctx_b.textBaseline = "top"
    ctx_b.textAlign = "end"
    ctx_b.font = '15px Arial'
    ctx_b.fillText('AVL', width_b - ind, 10)

    ctx_u.fillStyle = 'black'
    ctx_u.textBaseline = "top"
    ctx_u.textAlign = "end"
    ctx_u.font = '15px Arial'
    ctx_u.fillText('unbalanced', width_u - ind, 10)

    let trees = create_scheme()
    trees[0].draw(ctx_b, width_b, height_b)
    trees[1].draw(ctx_u, width_u, height_u)

    ctx_b.fillStyle = 'black'
    ctx_b.textBaseline = "top"
    ctx_b.textAlign = "start"
    ctx_b.font = '10px Arial'
    ctx_b.fillText('mean: ' + (trees[0].sum / trees[0].n_leafs).toFixed(2), 10, 10)
    ctx_b.fillText('max: ' + trees[0].root.depth, 10, 20)

    ctx_u.fillStyle = 'black'
    ctx_u.textBaseline = "top"
    ctx_u.textAlign = "start"
    ctx_u.font = '10px Arial'
    ctx_u.fillText('mean: ' + (trees[1].sum / trees[1].n_leafs).toFixed(2), 10, 10)
    ctx_u.fillText('max: ' + trees[1].root.depth, 10, 20)
}

ctx_b.fillStyle = 'black'
ctx_b.textBaseline = "top"
ctx_b.textAlign = "end"
ctx_b.font = '15px Arial'
ctx_b.fillText('AVL', width_b - ind, 10)

ctx_u.fillStyle = 'black'
ctx_u.textBaseline = "top"
ctx_u.textAlign = "end"
ctx_u.font = '15px Arial'
ctx_u.fillText('unbalanced', width_u - ind, 10)
