class PhoneBox {

    constructor(path, origin, angle, originalScreenSize, scalar) {
        this.path = path // [...Vector2d]
        this.origin = origin
        this.angle = angle
        this.originalScreenSize = originalScreenSize
        this.scalar = scalar
    }

    static fromUpdate(update) {
        return new PhoneBox([
            new Vector2d(0, 0),
            new Vector2d(update.data.screenWidth, 0),
            new Vector2d(update.data.screenWidth, update.data.screenHeight),
            new Vector2d(0, update.data.screenHeight),
        ], new Vector2d(0, 0), 0, new Vector2d(update.screenWidth, update.screenHeight), 1)
    }

    scale(scalar) {
        for (let vec of this.path) {
            vec.iscale(scalar)
        }

        this.scalar *= scalar
        this.origin.iscale(scalar)
    }

    rotate(angle) {
        for (let vec of this.path) {
            vec.irotate(angle)
        }

        this.angle += angle
        this.origin.irotate(angle)
    }

    translate(point) {
        for (let vec of this.path) {
            vec.iadd(point)
        }

        this.origin.iadd(point)
    }

    drawDebug(color="black") {
        this.scale(1 / 12)

        context.fillStyle = color
        context.beginPath()
        let isFirst = true
        for (let vec of this.path) {
            if (isFirst) {
                context.moveTo(canvas.width / 2 + vec.x, canvas.height / 2 + vec.y)
            } else {
                context.lineTo(canvas.width / 2 + vec.x, canvas.height / 2 + vec.y)
            }
            isFirst = false
        }
        context.fill()

        this.scale(12)
    }

}

class PhoneBoxCollection {

    constructor(phones=[]) {
        this.phones = phones
    }

    get length() {
        return this.phones.length
    }

    addPhone(phoneBox) {
        this.phones.push(phoneBox)
    }

    scale(scalar) {
        for (let phone of this.phones) {
            phone.scale(scalar)
        }
    }

    translate(point) {
        for (let phone of this.phones) {
            phone.translate(point)
        }
    }

    rotate(angle) {
        for (let phone of this.phones) {
            phone.rotate(angle)
        }
    }

    drawDebug(color="black") {
        for (let phone of this.phones) {
            phone.drawDebug(color)
        }
    }

}

class MinigolfBoard {

    isApproximatelySameTime(u1, u2) {
        return Math.abs(u1.timestamp - u2.timestamp) < 5000 // TODO: make this 500 again please
    }

    constructor() {
        this.phones = new PhoneBoxCollection()
        this.previousFieldPaths = []

        this._tempLastTouchBuildUpdate = null
    }

    get currIndex() {
        return Math.max(this.phones.length - 1, 0)
    }

    processUpdates(gameState, updates) {
        for (const update of updates) {
            if (update.type == updateType.TOUCH && gameState.phase == gamePhase.BUILDING) {
                if (!this._tempLastTouchBuildUpdate) {
                    this._tempLastTouchBuildUpdate = update
                } else {
                    if (!this.isApproximatelySameTime(this._tempLastTouchBuildUpdate, update)) {
                        this._tempLastTouchBuildUpdate = update
                        continue // we ignore previous event
                    }

                    let [u1, u2] = [this._tempLastTouchBuildUpdate, update]

                    if (Math.min(u1.index, u2.index) > this.currIndex || u1.index == u2.index) {
                        this._tempLastTouchBuildUpdate = update
                        continue // we ignore both events
                    }

                    if (u1.index > u2.index) {
                        const temp = u1
                        u1 = u2
                        u2 = temp
                    }

                    if (u1.index != this.currIndex) {
                        this._tempLastTouchBuildUpdate = update
                        continue // we ignore both events
                    }

                    const delta1 = Vector2d.fromObject(u1.data.touchUp).sub(Vector2d.fromObject(u1.data.touchDown))
                    const delta2 = Vector2d.fromObject(u2.data.touchUp).sub(Vector2d.fromObject(u2.data.touchDown))

                    let pp1Point = Vector2d.fromObject(u1.data.touchDown)
                    let pp2Point = Vector2d.fromObject(u2.data.touchDown)

                    if (this.phones.length == 0) {
                        this.phones.addPhone(PhoneBox.fromUpdate(u1))
                    }
                    
                    const phoneBox2 = PhoneBox.fromUpdate(u2)

                    // adjust scaling
                    phoneBox2.scale(delta1.length / delta2.length)
                    pp2Point.scale(delta1.length / delta1.length)

                    const angle1 = Math.round((-delta1.angle + Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2)
                    const angle2 = Math.round((-delta2.angle + Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2)

                    this.phones.rotate(angle1)
                    phoneBox2.rotate(angle2)
                    pp1Point.irotate(angle1)

                    this.phones.translate(pp2Point.sub(pp1Point))

                    canvas.width = canvas.clientWidth
                    canvas.height = canvas.clientHeight

                    this.phones.drawDebug("rgba(255, 0, 0, 0.3)")
                    phoneBox2.drawDebug("rgba(0, 0, 255, 0.3)")

                    this.phones.addPhone(phoneBox2)

                    window.phones = this.phones

                    context.fillStyle = "black"
                    context.fillRect(canvas.width / 2 - 5, canvas.height / 2 - 5, 10, 10)

                    this._tempLastTouchBuildUpdate = null
                }
            }
        }
    }

}