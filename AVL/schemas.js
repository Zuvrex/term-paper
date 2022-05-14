let sch1 = document.getElementById('c2')
let ctx1 = sch1.getContext('2d')
const width1 = sch1.width
const height1 = sch1.height

let sch2 = document.getElementById('c3')
let ctx2 = sch2.getContext('2d')
const width2 = sch2.width
const height2 = sch2.height

const ind = 20


class Node_schema {
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


class Tree_schema {
    constructor() {
        this.root = new Node_schema(null, null, null, null, null)
        this.size = 0
        this.max_x = 0
        this.max_y = 0
        this.n_leafs = 0
        this.sum = 0
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
        if (node.x > this.max_x) {
            this.max_x = node.x
        }
        if (node.y > this.max_y) {
            this.max_y = node.y
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
        context.fillStyle = 'black'
        context.arc(ind + node.x * (w - 2 * ind) / this.max_x, ind + node.y * (h - 2 * ind) / this.max_y, 4 / Math.log2(this.size), 0, 2 * Math.PI)
        context.stroke()
        context.fill()
        if (node.parent !== null) {
            context.beginPath()
            context.lineWidth = 4 / Math.log2(this.size)
            context.strokeStyle = 'black'
            context.moveTo(ind + node.x * (w - 2 * ind) / this.max_x, ind + node.y * (h - 2 * ind) / this.max_y)
            context.lineTo(ind + node.parent.x * (w - 2 * ind) / this.max_x, ind + node.parent.y * (h - 2 * ind) / this.max_y)
            context.stroke()
        }
    }
}


class Balanced extends Tree_schema {
    left_rotation(node) {
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

    right_rotation(node) {
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

    big_left_rotation(node) {
        this.right_rotation(node.right)
        this.left_rotation(node)
    }

    big_right_rotation(node) {
        this.left_rotation(node.left)
        this.right_rotation(node)
    }

    balancing(node) {
        if (node.right.depth - node.left.depth > 1 && node.right.left.depth > node.right.right.depth) {
            this.big_left_rotation(node)
        } else if (node.right.depth - node.left.depth > 1) {
            this.left_rotation(node)
        } else if (node.left.depth - node.right.depth > 1 && node.left.right.depth > node.left.left.depth) {
            this.big_right_rotation(node)
        } else if (node.left.depth - node.right.depth > 1) {
            this.right_rotation(node)
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
            obj.balancing(node)
            node = node.parent
        }
    }
}


class Unbalanced extends Tree_schema {
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
        node.left = new Node_schema(null, node, null, null, -1)
        node.right = new Node_schema(null, node, null, null, 1)
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


function create_schema(num=null) {
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

    let tree_b = new Balanced()
    let tree_u = new Unbalanced()

    for (let val of array) {
        tree_b.insert(val)
        tree_u.insert(val)
    }
    tree_b.coords()
    tree_u.coords()

    return [tree_b, tree_u]
}

function draw_schemas() {
    graph()

    ctx1.clearRect(0, 0, width1, height1)
    ctx2.clearRect(0, 0, width2, height2)

    let trees = create_schema()
    trees[0].draw(ctx1, width1, height1)
    trees[1].draw(ctx2, width2, height2)

    ctx1.fillStyle = 'black'
    ctx1.textBaseline = "top"
    ctx1.textAlign = "start"
    ctx1.font = '10px Arial'
    ctx1.fillText('mean: ' + (trees[0].sum / trees[0].n_leafs).toFixed(2), 10, 10)
    ctx1.fillText('max: ' + trees[0].root.depth, 10, 20)

    ctx2.fillStyle = 'black'
    ctx2.textBaseline = "top"
    ctx2.textAlign = "start"
    ctx2.font = '10px Arial'
    ctx2.fillText('mean: ' + (trees[1].sum / trees[1].n_leafs).toFixed(2), 10, 10)
    ctx2.fillText('max: ' + trees[1].root.depth, 10, 20)
}
