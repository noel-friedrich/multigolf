class PhoneBox {

    constructor(path, origin, angle, originalScreenSize, scalar, deviceIndex) {
        this.path = path // [...Vector2d]
        this.origin = origin
        this.angle = angle
        this.originalScreenSize = originalScreenSize
        this.scalar = scalar
        this.deviceIndex = deviceIndex
    }

    copy() {
        return new PhoneBox(
            this.path.map(v => v.copy()),
            this.origin.copy(),
            this.angle,
            this.originalScreenSize.copy(),
            this.scalar,
            this.deviceIndex
        )
    }

    screenPosToBoardPos(screenPos) {
        let pos = screenPos.rotate(this.angle)
        return this.origin.add(pos.scale(this.scalar))
    }

    boardPosToScreenPos(boardPos) {
        let pos = boardPos.sub(this.origin).scale(1 / this.scalar)
        return pos.rotate(-this.angle)
    }

    static fromUpdate(update) {
        return new PhoneBox([
            new Vector2d(0, 0),
            new Vector2d(update.data.screenWidth, 0),
            new Vector2d(update.data.screenWidth, update.data.screenHeight),
            new Vector2d(0, update.data.screenHeight),
        ], new Vector2d(0, 0), 0, new Vector2d(update.screenWidth, update.screenHeight), 1, update.index)
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
        return new PhoneBoxCollection(this.phones.map(p => p.copy()).concat([phoneBox]))
    }

    copy() {
        return new PhoneBoxCollection(this.phones.map(p => p.copy()))
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

    isSignificantDistance(distance) {
        return distance > 20
    }

    constructor() {
        this.previousPhones = [new PhoneBoxCollection()]

        this._tempLastTouchBuildUpdate = null
        this.connectionScreenPos = []

        this.startPos = null
        this.holePos = null
        
        this.ballPos = null
        this.ballVel = null
    }

    startGame() {
        this.ballPos = this.startPos.copy()
        this.ballVel = new Vector2d(0, 0)
    }

    get phones() {
        return this.previousPhones.slice(-1)[0]
    }

    get currIndex() {
        return Math.max(this.phones.length - 1, 0)
    }

    screenPosToBoardPos(pos) {
        return this.phones.phones[gameState.deviceIndex].screenPosToBoardPos(pos)
    }

    boardPosToScreenPos(pos) {
        return this.phones.phones[gameState.deviceIndex].boardPosToScreenPos(pos)
    }

    processUpdates(gameState, updates) {
        for (const update of updates) {
            if (update.type == updateType.PHASE) {
                gameState.phase = update.data.phase
                MenuGui.update()
            }

            if (update.type == updateType.TOUCH && ([gamePhase.PLACING_START, gamePhase.PLACING_HOLE].includes(gameState.phase))) {
                if (this.isSignificantDistance(
                    Vector2d.fromObject(update.data.touchUp).sub(Vector2d.fromObject(update.data.touchDown)).length
                )) {
                    continue
                }

                if (gameState.phase == gamePhase.PLACING_START) {
                    this.startPos = this.phones.phones[update.index].screenPosToBoardPos(Vector2d.fromObject(update.data.touchDown))
                } else if (gameState.phase == gamePhase.PLACING_HOLE) {
                    this.holePos = this.phones.phones[update.index].screenPosToBoardPos(Vector2d.fromObject(update.data.touchDown))
                }
            }

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
                        continue // we ignoe previous event
                    }

                    const u1IsOnSide = (((u1.data.touchDown.x == 0) || (u1.data.touchDown.x == u1.data.screenWidth))
                        || ((u1.data.touchDown.y == 0) || (u1.data.touchDown.y == u1.data.screenHeight)))

                    const u2IsOnSide = (((u2.data.touchDown.x == 0) || (u2.data.touchDown.x == u2.data.screenWidth))
                        || ((u2.data.touchDown.y == 0) || (u2.data.touchDown.y == u2.data.screenHeight)))

                    if (!u1IsOnSide || !u2IsOnSide) {
                        console.log("los", u1, u2, !u1IsOnSide, !u2IsOnSide)
                        this._tempLastTouchBuildUpdate = null
                        continue // we ignore both events
                    }

                    if (u1.index > u2.index) {
                        const temp = u1
                        u1 = u2
                        u2 = temp
                    }

                    if (u1.index < this.currIndex) {
                        while (this.phones.length > parseInt(u1.index) + 1) {
                            this.previousPhones.pop()
                        }

                        this.connectionScreenPos = this.connectionScreenPos.filter(c => {
                            return !(Math.max(c.targetIndex, c.deviceIndex) > u1.index)
                        })
                    }

                    const delta1 = Vector2d.fromObject(u1.data.touchUp).sub(Vector2d.fromObject(u1.data.touchDown))
                    const delta2 = Vector2d.fromObject(u2.data.touchUp).sub(Vector2d.fromObject(u2.data.touchDown))

                    let pp1Point = Vector2d.fromObject(u1.data.touchDown)
                    let pp2Point = Vector2d.fromObject(u2.data.touchDown)

                    if (this.phones.length == 0) {
                        this.previousPhones.push(this.phones.addPhone(PhoneBox.fromUpdate(u1)))
                    }
                    
                    const phoneBox2 = PhoneBox.fromUpdate(u2)

                    const newPhones = this.phones.copy()

                    // adjust scaling
                    newPhones.scale(delta2.length / delta1.length)
                    pp1Point.iscale(delta2.length / delta1.length)

                    let angle1 = delta2.angle - delta1.angle
                    angle1 = Math.round(angle1 / (Math.PI / 2)) * (Math.PI / 2)

                    newPhones.rotate(angle1)
                    pp1Point.irotate(angle1)

                    newPhones.translate(pp2Point.sub(pp1Point))

                    this.connectionScreenPos.push({
                        deviceIndex: u1.index,
                        targetIndex: u2.index,
                        start: Vector2d.fromObject(u1.data.touchDown),
                        end: Vector2d.fromObject(u1.data.touchUp),
                    })
                    
                    this.connectionScreenPos.push({
                        deviceIndex: u2.index,
                        targetIndex: u1.index,
                        start: Vector2d.fromObject(u2.data.touchDown),
                        end: Vector2d.fromObject(u2.data.touchUp),
                    })

                    this.previousPhones.push(newPhones.addPhone(phoneBox2))

                    this._tempLastTouchBuildUpdate = null
                }
            }
        }
    }

}