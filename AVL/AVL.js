let canvas = document.getElementById('AVL_canvas')
let ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height

const timeout = 15
const node_r = 20
const dist_x = 40
const dist_y = 100

const n_steps = 20
let speed_controller = 0

let t = [0]
let objects = new Set()
let sequence = [new Set()]
let functions = []

let img_index = -1
let img = new Image
let images = []

function log_canvas() {
    img_index = images.length
    images.push(canvas.toDataURL())
}


let tree_img

function draw_frame() {
    ctx.clearRect(0, 0, width, height)
    tree_img.draw()
    if (t[0] > 0) {
        for (let obj of objects) {
            obj.move()
        }
        t[0] -= 1
    } else {
        log_canvas()
        if (t.length > 1) {
            sequence.shift()
            t.shift()
            if (t[0] !== 0) {
                t[0] = Math.max(t[0] - speed_controller, 0)
            }
            for (let item of sequence[0]) {
                if (typeof item.obj === 'function') {
                    item.obj(item.args)
                } else {
                    item.obj.update(item.args)
                }
            }
        } else if (functions.length !== 0) {
            functions[0].f(functions[0].args.value, functions[0].args.obj)
            functions.shift()
            img_index = -1
            images = []
        }
    }
}

function draw_frame_no_animations() {
    ctx.clearRect(0, 0, width, height)
    tree_img.draw()
    if (t[0] > 0) {
        for (let obj of objects) {
            obj.move()
        }
        t[0] -= 1
    } else if (functions.length > 0) {
        log_canvas()
        while (functions.length !== 0) {
            functions[0].f(functions[0].args.value, functions[0].args.obj)
            functions.shift()
            img_index = -1
            images = []
        }
        sequence = [new Set()]
        tree_img.update_all()
        t = [20]
        for (let item of sequence[0]) {
            if (typeof item.obj === 'function') {
                item.obj(item.args)
            } else {
                item.obj.update(item.args)
            }
        }
    }
}

let df = draw_frame
let interval = setInterval(df, timeout)


class tree_image {
    constructor(tree) {
        this.tree = tree
        this.extra_value = new value_image(null, -1000, -1000, null)
        this.extra_depth1 = new value_image(null, -1000, -1000, null, '15px Arial')
        this.extra_depth2 = new value_image(null, -1000, -1000, null, '15px Arial')
    }

    update(node=this.tree.root, x = (width - dist_x * (this.tree.size - 1)) / 2, y=100) {
        if (node.value === null) {
            return x
        }
        x = this.update(node.left, x, y + dist_y)
        sequence[sequence.length - 1].add({obj: node.image, args: {t_x: {val: x}, t_y: {val: y}, t_r: {val: node_r}}})
        // node.image.set_target(x, y, 20)
        x += dist_x
        x = this.update(node.right, x, y + dist_y)
        return x
    }

    update_all(node=this.tree.root, x = (width - dist_x * (this.tree.size - 1)) / 2, y=100) {
        if (node.value === null) {
            return x
        }
        x = this.update_all(node.left, x, y + dist_y)

        node.image.x = {val: x}
        node.image.y = {val: y}
        node.image.r = {val: 0}
        node.image.target_x = {val: x}
        node.image.target_y = {val: y}
        node.image.target_r = {val: node_r}
        node.image.colour = {val: 'blue'}

        node.image.value_img.x = {val: x}
        node.image.value_img.y = {val: y}
        node.image.value_img.target_x = {val: x}
        node.image.value_img.target_y = {val: y}
        node.image.value_img.value = {val: node.value}
        node.image.value_img.colour = {val: 'black'}

        node.image.depth_img.x = {val: x}
        node.image.depth_img.y = {val: y}
        node.image.depth_img.target_x = {val: x}
        node.image.depth_img.target_y = {val: y}
        node.image.depth_img.value = {val: node.depth}
        node.image.depth_img.colour = {val: 'black'}

        node.image.edge_img.child = node
        node.image.edge_img.parent = node.parent
        node.image.edge_img.target = node.parent
        node.image.edge_img.x = {val: x}
        node.image.edge_img.y = {val: y}
        node.image.edge_img.colour = {val: '#c0c0c0'}

        x += dist_x
        x = this.update_all(node.right, x, y + dist_y)
        return x
    }

    add_target() {
        sequence.push(new Set())
        this.update()
        t.push(n_steps)
    }

    #draw_edges(node=this.tree.root) {
        if (node.value === null) {
            return
        }
        node.image.edge_img.draw()
        this.#draw_edges(node.left)
        this.#draw_edges(node.right)
    }

    draw(node=this.tree.root) {
        if (node.value === null) {
            return
        }
        if (node === this.tree.root) {
            this.#draw_edges()
            this.extra_value.draw()
            this.extra_depth1.draw()
            this.extra_depth2.draw()
        }
        this.draw(node.left)
        this.draw(node.right)
        node.image.draw()
    }
}


class node_image {
    constructor(object, x, y) {
        this.object = object
        this.x = {val: x}
        this.y = {val: y}
        this.r = {val: 0}
        this.target_x = {val: x}
        this.target_y = {val: y}
        this.target_r = {val: 0}
        this.colour = {val: 'red'}
        this.edge_img = new edge_image(object, object.parent)
        this.value_img = new value_image(object.value, x, y, object)
        this.depth_img = new value_image(0, x, y, object, '15px Arial')
        objects.add(this)
    }

    update(params) {
        if ('x' in params) {
            this.x.val = params.x.val
        }
        if ('y' in params) {
            this.y.val = params.y.val
        }
        if ('r' in params) {
            this.r.val = params.r.val
        }
        if ('t_x' in params) {
            this.target_x.val = params.t_x.val
        }
        if ('t_y' in params) {
            this.target_y.val = params.t_y.val
        }
        if ('t_r' in params) {
            this.target_r.val = params.t_r.val
        }
        if ('colour' in params) {
            this.colour.val = params.colour.val
        }

        // this.value_img.update({t_x: params.t_x, t_y: params.t_y})
        // this.depth_img.update({t_x: params.t_x, t_y: params.t_y + this.r + 15})
    }

    move() {
        this.x.val += (this.target_x.val - this.x.val) / t[0]
        this.y.val += (this.target_y.val - this.y.val) / t[0]
        this.r.val += (this.target_r.val - this.r.val) / t[0]
        this.value_img.update_coords()
        this.depth_img.update_coords()
        if (this.target_x.val !== this.x.val || this.target_y.val !== this.y.val) {
            this.edge_img.update_coords()
        }
    }

    draw() {
        if (this.r.val > 0) {
            this.depth_img.draw()
        }

        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.strokeStyle = this.colour.val
        ctx.fillStyle = 'white'
        ctx.arc(this.x.val, this.y.val, this.r.val, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()

        if (this.r.val > 0) {
            this.value_img.draw()
        }
    }
}


class value_image {
    constructor(value, x, y, object, font='25px Arial') {
        this.object = object
        this.x = {val: x}
        this.y = {val: y}
        this.target_x = {val: x}
        this.target_y = {val: y}
        this.value = {val: value}
        this.font = {val: font}
        this.colour = {val: 'black'}
        objects.add(this)
    }

    update_coords() {
        this.target_x.val = this.object.image.target_x.val
        this.target_y.val = this.object.image.target_y.val
        if (this.font.val !== '25px Arial') {
            this.target_y.val += this.object.image.r.val + 15
        }
    }

    update(params) {
        if ('x' in params) {
            this.x.val = params.x.val
        }
        if ('y' in params) {
            this.y.val = params.y.val
        }
        if ('t_x' in params) {
            this.target_x.val = params.t_x.val
        }
        if ('t_y' in params) {
            this.target_y.val = params.t_y.val
        }
        if ('value' in params) {
            this.value.val = params.value.val
        }
        if ('font' in params) {
            this.font.val = params.font.val
        }
        if ('colour' in params) {
            this.colour.val = params.colour.val
        }
    }

    move() {
        this.x.val += (this.target_x.val - this.x.val) / t[0]
        this.y.val += (this.target_y.val - this.y.val) / t[0]
    }

    draw() {
        ctx.fillStyle = this.colour.val
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.font = this.font.val
        ctx.fillText(this.value.val, this.x.val, this.y.val)
    }
}


class edge_image {
    constructor(child, parent) {
        this.child = child
        this.parent = parent
        this.target = parent
        this.colour = {val: '#c0c0c0'}
        this.update_coords()
        objects.add(this)
    }

    update_coords() {
        if (this.target !== null) {
            this.x = {val: this.target.image.x.val}
            this.y = {val: this.target.image.y.val}
        } else {
            this.x = {val: canvas.width / 2}
            this.y = {val: 100}
        }
    }

    update(params) {
        if ('child' in params) {
            this.child = params.child
        }
        if ('parent' in params) {
            this.parent = params.parent
        }
        if ('target' in params) {
            this.target = params.target
        }
        if ('colour' in params) {
            this.colour.val = params.colour.val
        }
        if ('x' in params) {
            this.x.val = params.x.val
        }
        if ('y' in params) {
            this.y.val = params.y.val
        }
    }

    move() {
        if (this.target !== null) {
            this.x.val += (this.target.image.x.val - this.x.val) / t[0]
            this.y.val += (this.target.image.y.val - this.y.val) / t[0]
        }
    }

    draw() {
        if (this.parent !== null) {
            ctx.beginPath()
            ctx.lineWidth = 5
            ctx.strokeStyle = this.colour.val
            ctx.moveTo(this.child.image.x.val, this.child.image.y.val)
            ctx.lineTo(this.x.val, this.y.val)
            ctx.stroke()
        }
    }
}


function comparsion(node, value, pred) {
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: {val: node.image.y.val - node.image.r.val - 35}, value: {val: value + pred + node.value}}},
        {obj: node.image, args: {colour: {val: 'red'}, t_r: {val: 2 * node_r}}}
    ]))
    t.push(n_steps)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {}}
    ]))
    t.push(n_steps)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}}
    ]))
    t.push(n_steps)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {value: {val: value}}},
        {obj: node.image, args: {colour: {val: 'orange'}, t_r: {val: node_r}}}
    ]))
    t.push(n_steps)
}

function balancing_draw(node) {
    if (node.left.depth > 0 || node.right.depth > 0) {
        sequence.push(new Set())
        t.push(n_steps)
    }
    if (node.left.depth > 0) {
        sequence[sequence.length - 1].add(
            {obj: tree_img.extra_depth1, args: {
                    x: node.left.image.depth_img.x, y: node.left.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.left.image.depth_img.y,
                    value: {val: node.left.depth}
                }}
        )
    }
    if (node.right.depth > 0) {
        sequence[sequence.length - 1].add(
            {obj: tree_img.extra_depth2, args: {
                    x: node.right.image.depth_img.x, y: node.right.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.right.image.depth_img.y,
                    value: {val: node.right.depth}
                }}
        )
    }
    remove_extra(tree_img.extra_depth1)
    remove_extra(tree_img.extra_depth2)

    if (node.right.depth > 0) {
        sequence.push(new Set([
            {obj: tree_img.extra_depth2, args: {
                    x: node.image.depth_img.x, y: node.right.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.right.image.depth_img.y,
                    value: {val: '|' + node.left.depth + '-' + node.right.depth + '|=' + Math.abs(node.right.depth - node.left.depth)}
                }}
        ]))
        t.push(n_steps)
    } else if (node.left.depth > 0) {
        sequence.push(new Set([
            {obj: tree_img.extra_depth1, args: {
                    x: node.image.depth_img.x, y: node.left.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.left.image.depth_img.y,
                    value: {val: '|' + node.left.depth + '-' + node.right.depth + '|=' + Math.abs(node.right.depth - node.left.depth)}
                }}
        ]))
        t.push(n_steps)
    }

    sequence.push(new Set())
    if (node.right.depth - node.left.depth > 1) {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: 'red'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: 'red'}}})
        }
        if (node.right.left.depth > node.right.right.depth) {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {val: 'red'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {val: 'red'}}})
            }
        } else {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {val: '#00d000'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {val: '#00d000'}}})
            }
        }
    } else if (node.left.depth - node.right.depth > 1) {
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: 'red'}}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: 'red'}}})
        }
        if (node.left.right.depth > node.left.left.depth) {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {val: 'red'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {val: 'red'}}})
            }
        } else {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {val: '#00d000'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {val: '#00d000'}}})
            }
        }
    } else {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: '#00d000'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: '#00d000'}}})
        }
    }
    t.push(n_steps * 2.5)

    sequence.push(new Set())
    if (node.right.depth - node.left.depth > 1) {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: 'black'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: 'black'}}})
        }
        if (node.right.left.depth > node.right.right.depth) {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {val: 'black'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {val: 'black'}}})
            }
        } else {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {val: 'black'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {val: 'black'}}})
            }
        }
    } else if (node.left.depth - node.right.depth > 1) {
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: 'black'}}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: 'black'}}})
        }
        if (node.left.right.depth > node.left.left.depth) {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {val: 'black'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {val: 'black'}}})
            }
        } else {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {val: 'black'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {val: 'black'}}})
            }
        }
    } else {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {val: 'black'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {val: 'black'}}})
        }
    }
    t.push(0)

    remove_extra(tree_img.extra_depth1)
    remove_extra(tree_img.extra_depth2)
}

function remove_extra(obj) {
    sequence.push(new Set([
        {obj: obj, args: {x: {val: -1000}, y: {val: -1000}, t_x: {val: -1000}, t_y: {val: -1000}}}
    ]))
    t.push(0)
}

function remove_node(params) {
    let node = params.node
    let side = params.side
    if (side < 0) {
        if (node.right.value !== null) {
            node.parent.left = node.right
            node.right.parent = node.parent
            node.right.side = side
            objects.delete(node)
            objects.delete(node.value_img)
            objects.delete(node.depth_img)
            objects.delete(node.edge_img)
            node = node.right
        } else {
            node.parent.left = node.left
            node.left.parent = node.parent
            objects.delete(node)
            objects.delete(node.value_img)
            objects.delete(node.depth_img)
            objects.delete(node.edge_img)
            if (node.left.value !== null) {
                node = node.left
            } else {
                node = node.parent
            }
        }
    } else if (side > 0) {
        if (node.left.value !== null) {
            node.parent.right = node.left
            node.left.parent = node.parent
            node.left.side = side
            objects.delete(node)
            objects.delete(node.value_img)
            objects.delete(node.depth_img)
            objects.delete(node.edge_img)
            node = node.left
        } else {
            node.parent.right = node.right
            node.right.parent = node.parent
            objects.delete(node)
            objects.delete(node.value_img)
            objects.delete(node.depth_img)
            objects.delete(node.edge_img)
            if (node.right.value !== null) {
                node = node.right
            } else {
                node = node.parent
            }
        }
    } else {
        node.value = null
        node.left = null
        node.right = null
        node.depth = 0
        objects.delete(node)
        objects.delete(node.value_img)
        objects.delete(node.depth_img)
        objects.delete(node.edge_img)
        node = node.parent
    }
    tree_img.add_target()

    while (node !== null) {
        sequence.push(new Set([
            {obj: node.image, args: {colour: {val: 'red'}}}
        ]))
        t.push(0)
        params.obj.balancing(node)
        sequence.push(new Set([
            {obj: node.image, args: {colour: {val: 'blue'}}}
        ]))
        t.push(0)
        node = node.parent
    }
}


class Node {
    constructor(value, parent, left, right, side) {
        this.value = value
        this.parent = parent
        this.left = left
        this.right = right
        this.depth = 0
        this.side = side
        this.image = null
    }
}


class AVL {
    constructor() {
        this.root = new Node(null, null, null, null, null)
        this.size = 0
        tree_img = new tree_image(this)
    }

    #count_depth(node) {
        if (node.left.depth > 0 || node.right.depth > 0) {
            sequence.push(new Set())
            t.push(n_steps)
        }
        if (node.left.depth > 0) {
            sequence[sequence.length - 1].add(
                {obj: tree_img.extra_depth1, args: {
                        x: node.left.image.depth_img.x, y: node.left.image.depth_img.y,
                        t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                        value: {val: node.left.depth}
                    }}
            )
        }
        if (node.right.depth > 0) {
            sequence[sequence.length - 1].add(
                {obj: tree_img.extra_depth2, args: {
                        x: node.right.image.depth_img.x, y: node.right.image.depth_img.y,
                        t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                        value: {val: node.right.depth}
                    }}
            )
        }
        remove_extra(tree_img.extra_depth1)
        remove_extra(tree_img.extra_depth2)

        node.depth = Math.max(node.left.depth, node.right.depth) + 1

        sequence.push(new Set([
            {obj: node.image.depth_img, args: {value: {val: ''}}}
        ]))
        t.push(0)
        sequence.push(new Set([
            {obj: tree_img.extra_depth2, args: {
                    x: node.image.depth_img.x, y: node.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                    value: {val: 'max+1'}
                }}
        ]))
        t.push(n_steps)
        sequence.push(new Set([
            {obj: tree_img.extra_depth2, args: {t_y: node.image.y}}
        ]))
        t.push(n_steps)
        remove_extra(tree_img.extra_depth2)
        sequence.push(new Set([
            {obj: node.image.depth_img, args: {y: node.image.y, value: {val: node.depth}}}
        ]))
        t.push(n_steps)
    }

    #left_rotation(node) {
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
        sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node.right}})
        if (node.right.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.left.image.edge_img, args: {target: node.right.left}})
        }
        t.push(n_steps)

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

        tree_img.add_target()
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node.parent, parent: node.parent}})
        sequence[sequence.length - 1].add({obj: node.parent.image, args: {colour: {val: 'orange'}}})
        if (node.parent.parent !== null) {
            sequence[sequence.length - 1].add({obj: node.parent.image.edge_img, args: {target: node.parent.parent}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node}})
        }
        t.push(n_steps)

        this.#count_depth(node)
    }

    #right_rotation(node) {
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
        sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node.left}})
        if (node.left.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.right.image.edge_img, args: {target: node.left.right}})
        }
        t.push(n_steps)

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

        tree_img.add_target()
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node.parent, parent: node.parent}})
        sequence[sequence.length - 1].add({obj: node.parent.image, args: {colour: {val: 'orange'}}})
        if (node.parent.parent !== null) {
            sequence[sequence.length - 1].add({obj: node.parent.image.edge_img, args: {target: node.parent.parent}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node}})
        }
        t.push(n_steps)

        this.#count_depth(node)
    }

    #big_left_rotation(node) {
        this.#right_rotation(node.right)
        this.#left_rotation(node)
    }

    #big_right_rotation(node) {
        this.#left_rotation(node.left)
        this.#right_rotation(node)
    }

    balancing(node) {
        balancing_draw(node)
        if (node.right.depth - node.left.depth > 1 && node.right.left.depth > node.right.right.depth) {
            this.#big_left_rotation(node)
        } else if (node.right.depth - node.left.depth > 1) {
            this.#left_rotation(node)
        } else if (node.left.depth - node.right.depth > 1 && node.left.right.depth > node.left.left.depth) {
            this.#big_right_rotation(node)
        } else if (node.left.depth - node.right.depth > 1) {
            this.#right_rotation(node)
        } else {
            this.#count_depth(node)
        }
    }

    insert(value, obj=this) {
        let node = obj.root
        sequence.push(new Set([
            {obj: tree_img.extra_value, args: {x: {val: canvas.width / 2}, y: {val: 50}, t_x: {val: canvas.width / 2}, t_y: {val: 50}, value: {val: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(n_steps)
            if (node.value > value) {
                comparsion(node, value, '<')
                node = node.left
            } else if (node.value < value) {
                comparsion(node, value, '>')
                node = node.right
            } else {
                comparsion(node, value, '=')
                while (node !== null) {
                    sequence.push(new Set([
                        {obj: node.image, args: {colour: {val: 'blue'}}}
                    ]))
                    t.push(0)
                    node = node.parent
                }
                return
            }
        }
        remove_extra(tree_img.extra_value)

        node.value = value
        node.left = new Node(null, node, null, null, -1)
        node.right = new Node(null, node, null, null, 1)
        obj.size += 1

        if (node.parent !== null) {
            node.image = new node_image(node, node.parent.image.x.val, node.parent.image.y.val)
        } else {
            node.image = new node_image(node, canvas.width / 2, 100)
        }
        tree_img.add_target()

        while (node !== null) {
            sequence.push(new Set([
                {obj: node.image, args: {colour: {val: 'red'}}}
            ]))
            t.push(0)
            obj.balancing(node)
            sequence.push(new Set([
                {obj: node.image, args: {colour: {val: 'blue'}}}
            ]))
            t.push(0)
            node = node.parent
        }
    }

    remove(value, obj=this) {
        let node = obj.root
        sequence.push(new Set([
            {obj: tree_img.extra_value, args: {x: {val: canvas.width / 2}, y: {val: 50}, t_x: {val: canvas.width / 2}, t_y: {val: 50}, value: {val: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(n_steps)
            if (node.value > value) {
                comparsion(node, value, '<')
                node = node.left
            } else if (node.value < value) {
                comparsion(node, value, '>')
                node = node.right
            } else {
                comparsion(node, value, '=')
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {val: 'green'}}},
                    {obj: node.image.value_img, args: {value: {val: ''}}}
                ]))
                t.push(0)
                obj.size -= 1
                break
            }
        }
        remove_extra(tree_img.extra_value)
        if (node.value === null) {
            while (node !== null) {
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {val: 'blue'}}}
                ]))
                t.push(0)
                node = node.parent
            }
            return
        }

        let deleted = node
        if (node.left.depth === 0 && node.right.depth === 0) {
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            t.push(n_steps)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {val: 0}}}
            ]))
            t.push(n_steps)
            sequence.push(new Set([{obj: remove_node, args: {node: node, side: 0, obj: obj}}]))
            t.push(0)
        } else if (node.left.depth > node.right.depth) {
            node = node.left
            sequence.push(new Set([
                {obj: node.image, args: {colour: {val: 'red'}}}
            ]))
            t.push(n_steps)
            while (node.right.value !== null) {
                node = node.right
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {val: 'red'}}},
                    {obj: node.parent.image, args: {colour: {val: 'orange'}}}
                ]))
                t.push(n_steps)
            }
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            if (node.left.value !== null) {
                sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node.left}})
            }
            t.push(n_steps)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {val: 0}}},
                {obj: node.image.value_img, args: {value: {val: ''}}},
                {obj: deleted.image.value_img, args: {
                        x: node.image.value_img.x, y: node.image.value_img.y,
                        t_x: deleted.image.value_img.x, t_y: deleted.image.value_img.y,
                        value: {val: node.value}
                    }}
            ]))
            t.push(n_steps)
            if (node.left.value !== null) {
                sequence.push(new Set())
                sequence[sequence.length - 1].add({
                    obj: node.left.image.edge_img,
                    args: {target: node.parent, parent: node.parent}
                })
                t.push(n_steps)
            }
            if (node.side !== -1) {
                sequence.push(new Set([{obj: remove_node, args: {node: node, side: 1, obj: obj}}]))
            } else {
                sequence.push(new Set([{obj: remove_node, args: {node: node, side: -1, obj: obj}}]))
            }
            t.push(0)
        } else {
            node = node.right
            sequence.push(new Set([
                {obj: node.image, args: {colour: {val: 'red'}}}
            ]))
            t.push(n_steps)
            while (node.left.value !== null) {
                node = node.left
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {val: 'red'}}},
                    {obj: node.parent.image, args: {colour: {val: 'orange'}}}
                ]))
                t.push(n_steps)
            }
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            if (node.right.value !== null) {
                sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node.right}})
            }
            t.push(n_steps)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {val: 0}}},
                {obj: node.image.value_img, args: {value: {val: ''}}},
                {obj: deleted.image.value_img, args: {
                        x: node.image.value_img.x, y: node.image.value_img.y,
                        t_x: deleted.image.value_img.x, t_y: deleted.image.value_img.y,
                        value: {val: node.value}
                    }}
            ]))
            t.push(n_steps)
            if (node.right.value !== null) {
                sequence.push(new Set())
                sequence[sequence.length - 1].add({
                    obj: node.right.image.edge_img,
                    args: {target: node.parent, parent: node.parent}
                })
                t.push(n_steps)
            }
            if (node.side !== 1) {
                sequence.push(new Set([{obj: remove_node, args: {node: node, side: -1, obj: obj}}]))
            } else {
                sequence.push(new Set([{obj: remove_node, args: {node: node, side: 1, obj: obj}}]))
            }
            t.push(0)
        }
        deleted.value = node.value
    }

    search(value, obj=this) {
        let node = obj.root
        sequence.push(new Set([
            {obj: tree_img.extra_value, args: {x: {val: canvas.width / 2}, y: {val: 50}, t_x: {val: canvas.width / 2}, t_y: {val: 50}, value: {val: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(n_steps)
            if (node.value > value) {
                comparsion(node, value, '<')
                node = node.left
            } else if (node.value < value) {
                comparsion(node, value, '>')
                node = node.right
            } else {
                comparsion(node, value, '=')
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {val: 'green'}}}
                ]))
                t.push(n_steps * 2.5)
                while (node !== null) {
                    sequence.push(new Set([
                        {obj: node.image, args: {colour: {val: 'blue'}}}
                    ]))
                    t.push(0)
                    node = node.parent
                }
                break
            }
        }
        remove_extra(tree_img.extra_value)

        while (node !== null) {
            sequence.push(new Set([
                {obj: node.image, args: {colour: {val: 'blue'}}}
            ]))
            t.push(0)
            node = node.parent
        }
    }
}





let avl = new AVL()

function create_tree() {
    df = draw_frame_no_animations
    clear_canvas()
    let values = document.getElementById('build').value.split(' ')
    document.getElementById('build').value = ''
    for (let val of values) {
        if (parseInt(val) < 101 && parseInt(val) > -1) {
            functions.push({f: avl.insert, args: {value: parseInt(val), obj: avl}})
        }
    }
    df = draw_frame
}

function insert_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('insert').value
    document.getElementById('insert').value = ''
    if (parseInt(val) < 101 && parseInt(val) > -1) {
        functions.push({f: avl.insert, args: {value: parseInt(val), obj: avl}})
    }
}

function remove_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('remove').value
    document.getElementById('remove').value = ''
    if (parseInt(val) < 101 && parseInt(val) > -1) {
        functions.push({f: avl.remove, args: {value: parseInt(val), obj: avl}})
    }
}

function search_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('search').value
    document.getElementById('search').value = ''
    if (parseInt(val) < 101 && parseInt(val) > -1) {
        functions.push({f: avl.search, args: {value: parseInt(val), obj: avl}})
    }
}

let slider = document.getElementById("range")
slider.oninput = function() {
    speed_controller = this.value;
}

function pause() {
    let btn = document.getElementById("pause")
    if (btn.innerHTML === 'II') {
        clearInterval(interval)
        btn.innerHTML = '???'
    } else {
        interval = setInterval(df, timeout)
        btn.innerHTML = 'II'
    }
}

function clear_canvas() {
    clearInterval(interval)

    t = [0]
    objects = new Set()
    sequence = [new Set()]
    functions = []

    img_index = -1
    img = new Image
    images = []

    interval = setInterval(df, timeout)

    avl = new AVL()
}

window.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
        if (document.getElementById('build').value !== '') {
            create_tree()
        }
        if (document.getElementById('insert').value !== '') {
            insert_value()
        }
        if (document.getElementById('remove').value !== '') {
            remove_value()
        }
        if (document.getElementById('search').value !== '') {
            search_value()
        }
    }
})
