class Renderer {

    get sizingFactor() {
        if (gameState.board.phones.length > 0 && gameState.board.phones.phones[gameState.deviceIndex]) {
            return gameState.board.phones.phones[gameState.deviceIndex].scalar * 300
        }

        return Math.min(canvas.width, canvas.height)
    }

    get ballRadius() {
        return this.sizingFactor * 0.05
    }

    renderBuilding(gameState) {
        context.font = `${this.sizingFactor * 0.4}px monospace`
        context.fillStyle = "white"

        context.textBaseline = "middle"
        context.textAlign = "center"
        context.fillText(gameState.deviceIndex, canvas.width / 2, canvas.height / 2)

        if (touchBlobPos) {
            touchBlobPos = touchBlobPos.lerp(touchBlobDesiredPos, 0.2)

            context.beginPath()
            context.fillStyle = "rgba(0, 0, 255, 0.5)"
            context.arc(touchBlobPos.x, touchBlobPos.y, this.sizingFactor * 0.1, 0, 2 * Math.PI, false)
            context.fill()
        }

        for (let connection of gameState.board.connectionScreenPos) {
            if (connection.deviceIndex != gameState.deviceIndex) {
                continue
            }

            context.beginPath()
            context.lineWidth = this.sizingFactor * 0.1
            context.moveTo(connection.start.x, connection.start.y)
            context.lineTo(connection.end.x, connection.end.y)
            context.strokeStyle = "blue"
            context.lineCap = "round"
            context.stroke()
        }

        if (new URLSearchParams(location.search).has("debug")) {
            gameState.board.phones.drawDebug("blue")
        }
    }

    renderBoard(gameState) {
        if (gameState.board.startPos) {
            const startScreenPos = gameState.board.boardPosToScreenPos(gameState.board.startPos)
            
            context.beginPath()
            context.fillStyle = "green"
            context.arc(startScreenPos.x, startScreenPos.y, this.sizingFactor * 0.06, 0, 2 * Math.PI, false)

            context.strokeStyle = "black"
            context.lineWidth = 2

            context.fill()   
            context.stroke()
        }

        if (gameState.board.holePos) {
            const holeScreenPos = gameState.board.boardPosToScreenPos(gameState.board.holePos)
            
            context.beginPath()
            context.fillStyle = "black"
            context.arc(holeScreenPos.x, holeScreenPos.y, this.sizingFactor * 0.06, 0, 2 * Math.PI, false)
            window.holeScreenPos = holeScreenPos
            context.fill()
        }

        for (let ball of gameState.board.balls) {
            const ballScreenPos = gameState.board.boardPosToScreenPos(ball.pos)
            
            context.beginPath()
            context.fillStyle = ball.color
            context.arc(ballScreenPos.x, ballScreenPos.y, this.ballRadius * Math.max(ball.radiusScalar, 0), 0, 2 * Math.PI, false)

            context.strokeStyle = "black"
            context.lineWidth = 5

            context.fill()   
            context.stroke()

            function easeOutBounce(x) {
                const n1 = 7.5625;
                const d1 = 2.75;
                
                if (x < 1 / d1) {
                    return n1 * x * x;
                } else if (x < 2 / d1) {
                    return n1 * (x -= 1.5 / d1) * x + 0.75;
                } else if (x < 2.5 / d1) {
                    return n1 * (x -= 2.25 / d1) * x + 0.9375;
                } else {
                    return n1 * (x -= 2.625 / d1) * x + 0.984375;
                }
            }

            if (ball.radiusScalar < 0) {
                context.textBaseline = "middle"
                context.textAlign = "center"
                context.fillStyle = "white"
                context.font = `${easeOutBounce(Math.abs(ball.radiusScalar)) * this.sizingFactor}px Arial`
                context.fillText(ball.kicks.toString(), ballScreenPos.x, ballScreenPos.y)
            }
        }
    }

    renderBallKicking(gameState) {
        if (!gameState.board.activeBall || !activeTouchPos || (gameState.board.ballVel && gameState.board.ballVel.length > 0)) {
            return
        }

        const ballScreenPos = gameState.board.boardPosToScreenPos(gameState.board.activeBall.pos)
        context.beginPath()
        context.moveTo(ballScreenPos.x, ballScreenPos.y)

        let dir = activeTouchPos.sub(ballScreenPos)
        if (dir.length > this.sizingFactor * 0.5) {
            dir = dir.normalized.scale(this.sizingFactor * 0.5)
        }

        dir.iscale(0.8 + Math.sin(Date.now() * 0.01) * 0.1)

        ballShootStrength = dir.length / (this.sizingFactor * 0.5)

        ballShootAngle = dir.angle + gameState.board.phones.phones[gameState.deviceIndex].angle

        context.strokeStyle = "rgba(0, 0, 0, 0.5)"
        context.lineWidth = this.sizingFactor * 0.03
        context.lineCap = "round"

        context.lineTo(ballScreenPos.x + dir.x, ballScreenPos.y + dir.y)

        context.stroke()
    }

    render(gameState) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        context.clearRect(0, 0, canvas.width, canvas.height)

        if (gameState.phase == gamePhase.BUILDING) {
            this.renderBuilding(gameState)
        } else if (gameState.phase == gamePhase.PLACING_START || gameState.phase == gamePhase.PLACING_HOLE) {
            this.renderBuilding(gameState)
            this.renderBoard(gameState)
        } else if (gameState.phase == gamePhase.PLAYING) {
            this.renderBoard(gameState)
            this.renderBallKicking(gameState)
        }
    }
}