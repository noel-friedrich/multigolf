class PhoneBox {

    constructor(path=[]) {
        this.path = path // [...Vector2d]
    }

    static fromUpdate(update) {
        return new PhoneBox([
            new Vector2d(0, 0),
            new Vector2d(update.data.screenWidth, 0),
            new Vector2d(update.data.screenWidth, update.data.screenHeight),
            new Vector2d(0, update.data.screenHeight),
        ])
    }

    scale(scalar) {
        for (let vec of this.path) {
            vec.iscale(scalar)
        }
    }

    rotate(angle) {
        for (let vec of this.path) {
            vec.irotate(angle)
        }
    }

    translate(point) {
        for (let vec of this.path) {
            vec.iadd(point)
        }
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

class MinigolfBoard {

    isApproximatelySameTime(u1, u2) {
        return Math.abs(u1.timestamp - u2.timestamp) < 5000 // TODO: make this 500 again please
    }

    constructor() {
        this.fieldPath = [] // [...Vector2d]

        this._tempLastTouchBuildUpdate = null
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

                    if (this._tempLastTouchBuildUpdate.index == update.index) {
                        this._tempLastTouchBuildUpdate = null
                        continue // we ignore both events
                    }

                    const [u1, u2] = [this._tempLastTouchBuildUpdate, update]
                    const delta1 = Vector2d.fromObject(u1.data.touchUp).sub(Vector2d.fromObject(u1.data.touchDown))
                    const delta2 = Vector2d.fromObject(u2.data.touchUp).sub(Vector2d.fromObject(u2.data.touchDown))

                    let pp1Point = Vector2d.fromObject(u1.data.touchDown)
                    let pp2Point = Vector2d.fromObject(u2.data.touchDown)

                    const phoneBox1 = PhoneBox.fromUpdate(u1)
                    const phoneBox2 = PhoneBox.fromUpdate(u2)

                    // adjust scaling
                    phoneBox1.scale(delta2.length / delta1.length)
                    pp1Point.scale(delta2.length / delta1.length)

                    const angle1 = Math.round((-delta1.angle + Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2)
                    const angle2 = Math.round((-delta2.angle + Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2)
                    phoneBox1.rotate(angle1)
                    phoneBox2.rotate(angle2)
                    pp2Point.irotate(angle2)

                    phoneBox2.translate(pp1Point.sub(pp2Point))

                    canvas.width = canvas.clientWidth
                    canvas.height = canvas.clientHeight
                    phoneBox1.drawDebug("red")
                    phoneBox2.drawDebug("blue")

                    this._tempLastTouchBuildUpdate = null
                }
            }
        }
    }

}