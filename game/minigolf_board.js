class PhoneBox {

    constructor(path, origin, angle, originalScreenSize, scalar, deviceIndex) {
        this.path = path // [...Vector2d]
        this.origin = origin
        this.angle = angle
        this.originalScreenSize = originalScreenSize
        this.scalar = scalar
        this.deviceIndex = deviceIndex
    }

    get walls() {
        return [
            [this.path[0], this.path[1]],
            [this.path[1], this.path[2]],
            [this.path[2], this.path[3]],
            [this.path[3], this.path[0]]
        ]
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

    getMinXY() {
        return [Math.min(this.path[0].x, this.path[2].x), Math.min(this.path[0].y, this.path[2].y)]
    }

    getMaxXY() {
        return [Math.max(this.path[0].x, this.path[2].x), Math.max(this.path[0].y, this.path[2].y)]
    }

    containsPoint(point) {
        const minX = Math.min(this.path[0].x, this.path[2].x)
        const minY = Math.min(this.path[0].y, this.path[2].y)
        const maxX = Math.max(this.path[0].x, this.path[2].x)
        const maxY = Math.max(this.path[0].y, this.path[2].y)
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
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

    containsPoint(point) {
        for (let phone of this.phones) {
            if (phone.containsPoint(point)) {
                return phone
            }
        }
        return false
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

        this.currPhysicsTime = null
        this.physicsUpdates = []

        this.physicsTickStep = 30
    }

    addPhysicsUpdate(update) {
        this.physicsUpdates.push(update)
    }

    updatePhysics() {
        const currTimestamp = Date.now()
        let count = 0
        while (this.currPhysicsTime < currTimestamp) {
            this.physicsStep(this.currPhysicsTime)
            count++
            this.currPhysicsTime += this.physicsTickStep

            if (count > 1000) {
                // don't do too many at a time to avoid lag
                break
            }
        }
    }

    isBallMoving() {
        return this.ballVel && this.ballVel.length > 0
    }

    isBoardPosInBoard(pos) {
        return this.phones.containsPoint(pos)
    }

    applyPhysicsUpdate(update) {
        if (update.type == updateType.KICK_BALL) {
            if (this.isBallMoving()) {
                return
            }

            this.ballVel = Vector2d.fromAngle(update.data.angle).scale(update.data.strength * 100)
        }
    }

    _distanceToWall(p1, p2, point) {
        let p2toP1 = p2.sub(p1)
        let p2toPoint = point.sub(p1)
        let d = p2toP1.dot(p2toPoint) / (p2toP1.length ** 2)

        if (d < 0) {
            return p1.distance(point)
        } else if (d > 1) {
            return p2.distance(point)
        } else {
            let closestPoint = p1.add(p2toP1.scale(d))
            return closestPoint.distance(point)
        }
    }

    _reflectAtWall(p1, p2, dir) {
        const wallDir = p2.sub(p1)
        const wallNormal = new Vector2d(-wallDir.y, wallDir.x)
        const angleDifference = dir.angle - wallNormal.angle
        return dir.rotate(-angleDifference * 2).scale(-1)
    }

    physicsStep(timestamp) {
        if (this.physicsUpdates.length > 0) {
            if (timestamp > this.physicsUpdates[0].timestamp) {
                this.applyPhysicsUpdate(this.physicsUpdates.shift())
            }
        }

        if (this.isBallMoving()) {
            this.ballPos.iadd(this.ballVel)
            this.ballVel.iscale(0.9)
            if (this.ballVel.length < 0.01) {
                this.ballVel = new Vector2d(0, 0)
            }
        }

        if (!this.isBoardPosInBoard(this.ballPos)) {
            let closestWall = null
            let closestPhone = null
            let smallestDistance = Infinity

            for (let phone of this.phones.phones) {
                for (let [p1, p2] of phone.walls) {
                    const distanceToWall = this._distanceToWall(p1, p2, this.ballPos)
                    if (distanceToWall < smallestDistance) {
                        closestWall = [p1, p2]
                        closestPhone = phone
                        smallestDistance = distanceToWall
                    }
                }
            }

            const [p1, p2] = closestWall
            this.ballPos.isub(this.ballVel)
            this.ballVel = this._reflectAtWall(p1, p2, this.ballVel)
            this.ballPos.iadd(this.ballVel)
            
            if (closestPhone.deviceIndex == gameState.deviceIndex) {
                navigator.vibrate([100])
            }
        }
    }

    startGame(timestamp) {
        this.ballPos = this.startPos.copy()
        this.ballVel = new Vector2d(0, 0)
        this.currPhysicsTime = timestamp
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
                if (gameState.phase != update.data.phase && update.data.phase == gamePhase.PLAYING) {
                    this.startGame(update.timestamp)
                }

                gameState.phase = update.data.phase
                MenuGui.update()
            }

            if (gameState.phase == gamePhase.PLAYING && update.type == updateType.KICK_BALL) {
                this.addPhysicsUpdate(update)
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