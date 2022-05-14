let canvas = document.getElementById('AVL_canvas')
let ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height

const timeout = 15
const node_r = 20
const dist_x = 40
const dist_y = 100

const speed = 20
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
        sequence[sequence.length - 1].add({obj: node.image, args: {t_x: {ext: x}, t_y: {ext: y}, t_r: {ext: node_r}}})
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

        node.image.x = {ext: x}
        node.image.y = {ext: y}
        node.image.r = {ext: 0}
        node.image.target_x = {ext: x}
        node.image.target_y = {ext: y}
        node.image.target_r = {ext: node_r}
        node.image.colour = {ext: 'blue'}

        node.image.value_img.x = {ext: x}
        node.image.value_img.y = {ext: y}
        node.image.value_img.target_x = {ext: x}
        node.image.value_img.target_y = {ext: y}
        node.image.value_img.value = {ext: node.value}
        node.image.value_img.colour = {ext: 'black'}

        node.image.depth_img.x = {ext: x}
        node.image.depth_img.y = {ext: y}
        node.image.depth_img.target_x = {ext: x}
        node.image.depth_img.target_y = {ext: y}
        node.image.depth_img.value = {ext: node.depth}
        node.image.depth_img.colour = {ext: 'black'}

        node.image.edge_img.child = node
        node.image.edge_img.parent = node.parent
        node.image.edge_img.target = node.parent
        node.image.edge_img.x = {ext: x}
        node.image.edge_img.y = {ext: y}
        node.image.edge_img.colour = {ext: '#c0c0c0'}

        x += dist_x
        x = this.update_all(node.right, x, y + dist_y)
        return x
    }

    add_target() {
        sequence.push(new Set())
        this.update()
        t.push(speed)
    }

    draw_edges(node=this.tree.root) {
        if (node.value === null) {
            return
        }
        node.image.edge_img.draw()
        this.draw_edges(node.left)
        this.draw_edges(node.right)
    }

    draw(node=this.tree.root) {
        if (node.value === null) {
            return
        }
        if (node === this.tree.root) {
            this.draw_edges()
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
        this.x = {ext: x}
        this.y = {ext: y}
        this.r = {ext: 0}
        this.target_x = {ext: x}
        this.target_y = {ext: y}
        this.target_r = {ext: 0}
        this.colour = {ext: 'red'}
        this.edge_img = new edge_image(object, object.parent)
        this.value_img = new value_image(object.value, x, y, object)
        this.depth_img = new value_image(0, x, y, object, '15px Arial')
        objects.add(this)
    }

    update(params) {
        if ('x' in params) {
            this.x.ext = params.x.ext
        }
        if ('y' in params) {
            this.y.ext = params.y.ext
        }
        if ('r' in params) {
            this.r.ext = params.r.ext
        }
        if ('t_x' in params) {
            this.target_x.ext = params.t_x.ext
        }
        if ('t_y' in params) {
            this.target_y.ext = params.t_y.ext
        }
        if ('t_r' in params) {
            this.target_r.ext = params.t_r.ext
        }
        if ('colour' in params) {
            this.colour.ext = params.colour.ext
        }

        // this.value_img.update({t_x: params.t_x, t_y: params.t_y})
        // this.depth_img.update({t_x: params.t_x, t_y: params.t_y + this.r + 15})
    }

    move() {
        this.x.ext += (this.target_x.ext - this.x.ext) / t[0]
        this.y.ext += (this.target_y.ext - this.y.ext) / t[0]
        this.r.ext += (this.target_r.ext - this.r.ext) / t[0]
        this.value_img.update_coords()
        this.depth_img.update_coords()
        if (this.target_x.ext !== this.x.ext || this.target_y.ext !== this.y.ext) {
            this.edge_img.update_coords()
        }
    }

    draw() {
        if (this.r.ext > 0) {
            this.depth_img.draw()
        }

        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.strokeStyle = this.colour.ext
        ctx.fillStyle = 'white'
        ctx.arc(this.x.ext, this.y.ext, this.r.ext, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()

        if (this.r.ext > 0) {
            this.value_img.draw()
        }
    }
}


class value_image {
    constructor(value, x, y, object, font='25px Arial') {
        this.object = object
        this.x = {ext: x}
        this.y = {ext: y}
        this.target_x = {ext: x}
        this.target_y = {ext: y}
        this.value = {ext: value}
        this.font = {ext: font}
        this.colour = {ext: 'black'}
        objects.add(this)
    }

    update_coords() {
        this.target_x.ext = this.object.image.target_x.ext
        this.target_y.ext = this.object.image.target_y.ext
        if (this.font.ext !== '25px Arial') {
            this.target_y.ext += this.object.image.r.ext + 15
        }
    }

    update(params) {
        if ('x' in params) {
            this.x.ext = params.x.ext
        }
        if ('y' in params) {
            this.y.ext = params.y.ext
        }
        if ('t_x' in params) {
            this.target_x.ext = params.t_x.ext
        }
        if ('t_y' in params) {
            this.target_y.ext = params.t_y.ext
        }
        if ('value' in params) {
            this.value.ext = params.value.ext
        }
        if ('font' in params) {
            this.font.ext = params.font.ext
        }
        if ('colour' in params) {
            this.colour.ext = params.colour.ext
        }
    }

    move() {
        this.x.ext += (this.target_x.ext - this.x.ext) / t[0]
        this.y.ext += (this.target_y.ext - this.y.ext) / t[0]
    }

    draw() {
        ctx.fillStyle = this.colour.ext
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.font = this.font.ext
        ctx.fillText(this.value.ext, this.x.ext, this.y.ext)
    }
}


class edge_image {
    constructor(child, parent) {
        this.child = child
        this.parent = parent
        this.target = parent
        this.colour = {ext: '#c0c0c0'}
        this.update_coords()
        objects.add(this)
    }

    update_coords() {
        if (this.target !== null) {
            this.x = {ext: this.target.image.x.ext}
            this.y = {ext: this.target.image.y.ext}
        } else {
            this.x = {ext: canvas.width / 2}
            this.y = {ext: 100}
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
            this.colour.ext = params.colour.ext
        }
        if ('x' in params) {
            this.x.ext = params.x.ext
        }
        if ('y' in params) {
            this.y.ext = params.y.ext
        }
    }

    move() {
        if (this.target !== null) {
            this.x.ext += (this.target.image.x.ext - this.x.ext) / t[0]
            this.y.ext += (this.target.image.y.ext - this.y.ext) / t[0]
        }
    }

    draw() {
        if (this.parent !== null) {
            ctx.beginPath()
            ctx.lineWidth = 5
            ctx.strokeStyle = this.colour.ext
            ctx.moveTo(this.child.image.x.ext, this.child.image.y.ext)
            ctx.lineTo(this.x.ext, this.y.ext)
            ctx.stroke()
        }
    }
}


function comparsion(node, value, pred) {
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: {ext: node.image.y.ext - node.image.r.ext - 35}, value: {ext: value + pred + node.value}}},
        {obj: node.image, args: {colour: {ext: 'red'}, t_r: {ext: 2 * node_r}}}
    ]))
    t.push(speed)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {}}
    ]))
    t.push(speed)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}}
    ]))
    t.push(speed)
    sequence.push(new Set([
        {obj: tree_img.extra_value, args: {value: {ext: value}}},
        {obj: node.image, args: {colour: {ext: 'orange'}, t_r: {ext: node_r}}}
    ]))
    t.push(speed)
}

function balancing_draw(node) {
    if (node.left.depth > 0 || node.right.depth > 0) {
        sequence.push(new Set())
        t.push(speed)
    }
    if (node.left.depth > 0) {
        sequence[sequence.length - 1].add(
            {obj: tree_img.extra_depth1, args: {
                    x: node.left.image.depth_img.x, y: node.left.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.left.image.depth_img.y,
                    value: {ext: node.left.depth}
                }}
        )
    }
    if (node.right.depth > 0) {
        sequence[sequence.length - 1].add(
            {obj: tree_img.extra_depth2, args: {
                    x: node.right.image.depth_img.x, y: node.right.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.right.image.depth_img.y,
                    value: {ext: node.right.depth}
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
                    value: {ext: '|' + node.left.depth + '-' + node.right.depth + '|=' + Math.abs(node.right.depth - node.left.depth)}
                }}
        ]))
        t.push(speed)
    } else if (node.left.depth > 0) {
        sequence.push(new Set([
            {obj: tree_img.extra_depth1, args: {
                    x: node.image.depth_img.x, y: node.left.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.left.image.depth_img.y,
                    value: {ext: '|' + node.left.depth + '-' + node.right.depth + '|=' + Math.abs(node.right.depth - node.left.depth)}
                }}
        ]))
        t.push(speed)
    }

    sequence.push(new Set())
    if (node.right.depth - node.left.depth > 1) {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: 'red'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: 'red'}}})
        }
        if (node.right.left.depth > node.right.right.depth) {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {ext: 'red'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {ext: 'red'}}})
            }
        } else {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {ext: '#00d000'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {ext: '#00d000'}}})
            }
        }
    } else if (node.left.depth - node.right.depth > 1) {
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: 'red'}}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: 'red'}}})
        }
        if (node.left.right.depth > node.left.left.depth) {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {ext: 'red'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {ext: 'red'}}})
            }
        } else {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {ext: '#00d000'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {ext: '#00d000'}}})
            }
        }
    } else {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: '#00d000'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: '#00d000'}}})
        }
    }
    t.push(speed * 2.5)

    sequence.push(new Set())
    if (node.right.depth - node.left.depth > 1) {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: 'black'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: 'black'}}})
        }
        if (node.right.left.depth > node.right.right.depth) {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {ext: 'black'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {ext: 'black'}}})
            }
        } else {
            if (node.right.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.left.image.depth_img, args: {colour: {ext: 'black'}}})
            }
            if (node.right.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.right.right.image.depth_img, args: {colour: {ext: 'black'}}})
            }
        }
    } else if (node.left.depth - node.right.depth > 1) {
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: 'black'}}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: 'black'}}})
        }
        if (node.left.right.depth > node.left.left.depth) {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {ext: 'black'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {ext: 'black'}}})
            }
        } else {
            if (node.left.right.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.right.image.depth_img, args: {colour: {ext: 'black'}}})
            }
            if (node.left.left.image !== null) {
                sequence[sequence.length - 1].add({obj: node.left.left.image.depth_img, args: {colour: {ext: 'black'}}})
            }
        }
    } else {
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.depth_img, args: {colour: {ext: 'black'}}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.depth_img, args: {colour: {ext: 'black'}}})
        }
    }
    t.push(0)

    remove_extra(tree_img.extra_depth1)
    remove_extra(tree_img.extra_depth2)
}

function remove_extra(obj) {
    sequence.push(new Set([
        {obj: obj, args: {x: {ext: -1000}, y: {ext: -1000}, t_x: {ext: -1000}, t_y: {ext: -1000}}}
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
            node = node.right
        } else {
            node.parent.left = node.left
            node.left.parent = node.parent
            objects.delete(node)
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
            node = node.left
        } else {
            node.parent.right = node.right
            node.right.parent = node.parent
            objects.delete(node)
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
        objects.delete(node)
        node = node.parent
    }
    tree_img.add_target()

    while (node !== null) {
        sequence.push(new Set([
            {obj: node.image, args: {colour: {ext: 'red'}}}
        ]))
        t.push(0)
        params.obj.balancing(node)
        sequence.push(new Set([
            {obj: node.image, args: {colour: {ext: 'blue'}}}
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

    count_depth(node) {
        if (node.left.depth > 0 || node.right.depth > 0) {
            sequence.push(new Set())
            t.push(speed)
        }
        if (node.left.depth > 0) {
            sequence[sequence.length - 1].add(
                {obj: tree_img.extra_depth1, args: {
                        x: node.left.image.depth_img.x, y: node.left.image.depth_img.y,
                        t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                        value: {ext: node.left.depth}
                    }}
            )
        }
        if (node.right.depth > 0) {
            sequence[sequence.length - 1].add(
                {obj: tree_img.extra_depth2, args: {
                        x: node.right.image.depth_img.x, y: node.right.image.depth_img.y,
                        t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                        value: {ext: node.right.depth}
                    }}
            )
        }
        remove_extra(tree_img.extra_depth1)
        remove_extra(tree_img.extra_depth2)

        node.depth = Math.max(node.left.depth, node.right.depth) + 1

        sequence.push(new Set([
            {obj: node.image.depth_img, args: {value: {ext: ''}}}
        ]))
        t.push(0)
        sequence.push(new Set([
            {obj: tree_img.extra_depth2, args: {
                    x: node.image.depth_img.x, y: node.image.depth_img.y,
                    t_x: node.image.depth_img.x, t_y: node.image.depth_img.y,
                    value: {ext: 'max+1'}
                }}
        ]))
        t.push(speed)
        sequence.push(new Set([
            {obj: tree_img.extra_depth2, args: {t_y: node.image.y}}
        ]))
        t.push(speed)
        remove_extra(tree_img.extra_depth2)
        sequence.push(new Set([
            {obj: node.image.depth_img, args: {y: node.image.y, value: {ext: node.depth}}}
        ]))
        t.push(speed)
    }

    left_rotation(node) {
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
        sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node.right}})
        if (node.right.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.left.image.edge_img, args: {target: node.right.left}})
        }
        t.push(speed)

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
        sequence[sequence.length - 1].add({obj: node.parent.image, args: {colour: {ext: 'orange'}}})
        if (node.parent.parent !== null) {
            sequence[sequence.length - 1].add({obj: node.parent.image.edge_img, args: {target: node.parent.parent}})
        }
        if (node.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node}})
        }
        t.push(speed)

        this.count_depth(node)
    }

    right_rotation(node) {
        sequence.push(new Set())
        sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
        sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node.left}})
        if (node.left.right.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.right.image.edge_img, args: {target: node.left.right}})
        }
        t.push(speed)

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
        sequence[sequence.length - 1].add({obj: node.parent.image, args: {colour: {ext: 'orange'}}})
        if (node.parent.parent !== null) {
            sequence[sequence.length - 1].add({obj: node.parent.image.edge_img, args: {target: node.parent.parent}})
        }
        if (node.left.image !== null) {
            sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node}})
        }
        t.push(speed)

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
        balancing_draw(node)
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
        sequence.push(new Set([
            {obj: tree_img.extra_value, args: {x: {ext: canvas.width / 2}, y: {ext: 50}, t_x: {ext: canvas.width / 2}, t_y: {ext: 50}, value: {ext: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(speed)
            // sequence.push(new Set([{obj: node.image, args: {t_r: 2 * node_r}}]))
            // t.push(10)
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
                        {obj: node.image, args: {colour: {ext: 'blue'}}}
                    ]))
                    t.push(0)
                    node = node.parent
                }
                return
            }
            // sequence.push(new Set([{obj: node.parent.image, args: {t_r: node_r}}]))
            // t.push(10)
        }
        remove_extra(tree_img.extra_value)

        node.value = value
        node.left = new Node(null, node, null, null, -1)
        node.right = new Node(null, node, null, null, 1)
        obj.size += 1

        if (node.parent !== null) {
            node.image = new node_image(node, node.parent.image.x.ext, node.parent.image.y.ext)
        } else {
            node.image = new node_image(node, canvas.width / 2, 100)
        }
        tree_img.add_target()

        while (node !== null) {
            sequence.push(new Set([
                {obj: node.image, args: {colour: {ext: 'red'}}}
            ]))
            t.push(0)
            obj.balancing(node)
            sequence.push(new Set([
                {obj: node.image, args: {colour: {ext: 'blue'}}}
            ]))
            t.push(0)
            node = node.parent
            // ...................................
            // this.new_target()
            // objects = [new tree_image(this.root)]
        }
    }

    remove(value, obj=this) {
        let node = obj.root
        sequence.push(new Set([
            {obj: tree_img.extra_value, args: {x: {ext: canvas.width / 2}, y: {ext: 50}, t_x: {ext: canvas.width / 2}, t_y: {ext: 50}, value: {ext: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(speed)
            if (node.value > value) {
                comparsion(node, value, '<')
                node = node.left
            } else if (node.value < value) {
                comparsion(node, value, '>')
                node = node.right
            } else {
                comparsion(node, value, '=')
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {ext: 'green'}}},
                    {obj: node.image.value_img, args: {value: {ext: ''}}}
                ]))
                t.push(0)
                break
            }
        }
        remove_extra(tree_img.extra_value)

        let deleted = node
        if (node.left.depth === 0 && node.right.depth === 0) {
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            t.push(speed)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {ext: 0}}}
            ]))
            t.push(speed)
            sequence.push(new Set([{obj: remove_node, args: {node: node, side: 0, obj: obj}}]))
            t.push(0)
        } else if (node.left.depth > node.right.depth) {
            node = node.left
            sequence.push(new Set([
                {obj: node.image, args: {colour: {ext: 'red'}}}
            ]))
            t.push(speed)
            while (node.right.value !== null) {
                node = node.right
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {ext: 'red'}}},
                    {obj: node.parent.image, args: {colour: {ext: 'orange'}}}
                ]))
                t.push(speed)
            }
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            if (node.left.value !== null) {
                sequence[sequence.length - 1].add({obj: node.left.image.edge_img, args: {target: node.left}})
            }
            t.push(speed)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {ext: 0}}},
                {obj: node.image.value_img, args: {value: {ext: ''}}},
                {obj: deleted.image.value_img, args: {
                        x: node.image.value_img.x, y: node.image.value_img.y,
                        t_x: deleted.image.value_img.x, t_y: deleted.image.value_img.y,
                        value: {ext: node.value}
                }}
            ]))
            t.push(speed)
            if (node.left.value !== null) {
                sequence.push(new Set())
                sequence[sequence.length - 1].add({
                    obj: node.left.image.edge_img,
                    args: {target: node.parent, parent: node.parent}
                })
                t.push(speed)
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
                {obj: node.image, args: {colour: {ext: 'red'}}}
            ]))
            t.push(speed)
            while (node.left.value !== null) {
                node = node.left
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {ext: 'red'}}},
                    {obj: node.parent.image, args: {colour: {ext: 'orange'}}}
                ]))
                t.push(speed)
            }
            sequence.push(new Set())
            sequence[sequence.length - 1].add({obj: node.image.edge_img, args: {target: node}})
            if (node.right.value !== null) {
                sequence[sequence.length - 1].add({obj: node.right.image.edge_img, args: {target: node.right}})
            }
            t.push(speed)
            sequence.push(new Set([
                {obj: node.image, args: {t_r: {ext: 0}}},
                {obj: node.image.value_img, args: {value: {ext: ''}}},
                {obj: deleted.image.value_img, args: {
                        x: node.image.value_img.x, y: node.image.value_img.y,
                        t_x: deleted.image.value_img.x, t_y: deleted.image.value_img.y,
                        value: {ext: node.value}
                }}
            ]))
            t.push(speed)
            if (node.right.value !== null) {
                sequence.push(new Set())
                sequence[sequence.length - 1].add({
                    obj: node.right.image.edge_img,
                    args: {target: node.parent, parent: node.parent}
                })
                t.push(speed)
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
            {obj: tree_img.extra_value, args: {x: {ext: canvas.width / 2}, y: {ext: 50}, t_x: {ext: canvas.width / 2}, t_y: {ext: 50}, value: {ext: value}}}
        ]))
        t.push(0)
        while (node.value !== null) {
            sequence.push(new Set([
                {obj: tree_img.extra_value, args: {t_x: node.image.x, t_y: node.image.y}},
            ]))
            t.push(speed)
            // sequence.push(new Set([{obj: node.image, args: {t_r: 2 * node_r}}]))
            // t.push(10)
            if (node.value > value) {
                comparsion(node, value, '<')
                node = node.left
            } else if (node.value < value) {
                comparsion(node, value, '>')
                node = node.right
            } else {
                comparsion(node, value, '=')
                sequence.push(new Set([
                    {obj: node.image, args: {colour: {ext: 'green'}}}
                ]))
                t.push(speed * 2.5)
                while (node !== null) {
                    sequence.push(new Set([
                        {obj: node.image, args: {colour: {ext: 'blue'}}}
                    ]))
                    t.push(0)
                    node = node.parent
                }
                break;
            }
        }
        remove_extra(tree_img.extra_value)

        while (node !== null) {
            sequence.push(new Set([
                {obj: node.image, args: {colour: {ext: 'blue'}}}
            ]))
            t.push(0)
            node = node.parent
        }
    }

    // find_min(node) {
    //     if (node.depth === 1) {
    //         return node
    //     }
    //     return this.find_min(node.left)
    // }
    //
    // find_max(node) {
    //     if (node.depth === 1) {
    //         return node
    //     }
    //     return this.find_min(node.right)
    // }

    // remove(value) {
    //     let node = this.search(value)
    //     if (node === null) {
    //         return
    //     }
    //
    //     this.size -= 1
    //     if (node.right.value === null) {
    //         node.left.parent = node.parent
    //         node.parent.right = node.left
    //         if (node === this.root) {
    //             this.root = node.left
    //         } node = node.left
    //     } else {
    //         let min = this.find_min(node.right)
    //         node.value = min.value
    //         min.right.parent = min.parent
    //         if (min === node.right) {
    //             min.parent.right = min.right
    //         } else {
    //             min.parent.left = min.right
    //         } node = min
    //     }
    //
    //
    //     while (node.parent !== null) {
    //         node = node.parent
    //         this.count_depth(node)
    //         this.balancing(node)
    //     }
    // }
}





let avl = new AVL()

function create_tree() {
    df = draw_frame_no_animations
    clear_canvas()
    let values = document.getElementById('build').value.split(' ')
    document.getElementById('build').value = ''
    for (let val of values) {
        functions.push({f: avl.insert, args: {value: parseInt(val), obj: avl}})
    }
    df = draw_frame
}

function insert_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('insert').value
    document.getElementById('insert').value = ''
    functions.push({f: avl.insert, args: {value: parseInt(val), obj: avl}})
}

function remove_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('remove').value
    document.getElementById('remove').value = ''
    functions.push({f: avl.remove, args: {value: parseInt(val), obj: avl}})
}

function search_value() {
    clearInterval(interval)
    interval = setInterval(df, timeout)
    let val = document.getElementById('search').value
    document.getElementById('search').value = ''
    functions.push({f: avl.search, args: {value: parseInt(val), obj: avl}})
}

let slider = document.getElementById("range")
slider.oninput = function() {
    speed_controller = this.value;
}

function on_off() {
    let btn = document.getElementById("b1")
    if (df === draw_frame) {
        tree_img.extra_value.update({x: {ext: -1000}, y: {ext: -1000}, t_x: {ext: -1000}, t_y: {ext: -1000}})
        tree_img.extra_depth1.update({x: {ext: -1000}, y: {ext: -1000}, t_x: {ext: -1000}, t_y: {ext: -1000}})
        tree_img.extra_depth2.update({x: {ext: -1000}, y: {ext: -1000}, t_x: {ext: -1000}, t_y: {ext: -1000}})
        df = draw_frame_no_animations
        btn.innerHTML = 'Вкл. анимацию'
    } else {
        df = draw_frame
        btn.innerHTML = 'Выкл. анимацию'
    }
    clearInterval(interval)
    interval = setInterval(df, timeout)
}

function forward() {
    clearInterval(interval)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (img_index < images.length - 1) {
        img_index += 1
    }
    img.src = images[img_index]
    ctx.drawImage(img, 0, 0)
}

function backward() {
    clearInterval(interval)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (img_index > 0) {
        img_index -= 1
    }
    img.src = images[img_index]
    ctx.drawImage(img, 0, 0)
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

// on_off()
// functions.push({f: avl.insert, args: {value: 4, obj: avl}})
// functions.push({f: avl.insert, args: {value: 2, obj: avl}})
// functions.push({f: avl.insert, args: {value: 7, obj: avl}})
// functions.push({f: avl.insert, args: {value: 1, obj: avl}})
// functions.push({f: avl.insert, args: {value: 3, obj: avl}})
// functions.push({f: avl.insert, args: {value: 5, obj: avl}})
// functions.push({f: avl.insert, args: {value: 8, obj: avl}})
// functions.push({f: avl.insert, args: {value: 6, obj: avl}})
// functions.push({f: avl.remove, args: {value: 4, obj: avl}})

// b.insert(13)
// b.insert(29)
// b.insert(97)
// b.insert(82)
// b.insert(1)
// b.insert(60)
// b.insert(69)
// b.insert(27)
// b.insert(47)
// b.insert(28)

// b.remove(13)
// b.remove(97)
// b.remove(27)
// b.remove(60)
// b.remove(82)
// b.remove(1)
//
// b.insert(57)
// b.insert(56)
// b.insert(35)
// b.insert(84)
// b.insert(10)
// b.insert(20)
// b.insert(40)
// b.insert(11)
// b.insert(8)
// b.insert(59)
//
// b.remove(69)
// b.remove(10)
// b.remove(8)
// b.remove(29)
// b.remove(40)
// b.remove(35)

// let c = b.traversal()
