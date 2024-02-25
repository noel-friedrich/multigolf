class Renderer {

    renderBuilding(gameState) {
        const sizingFactor = Math.min(canvas.width, canvas.height)

        context.font = `${sizingFactor * 0.4}px monospace`
        context.fillStyle = "white"

        context.textBaseline = "middle"
        context.textAlign = "center"
        context.fillText(gameState.deviceIndex, canvas.width / 2, canvas.height / 2)

        if (touchBlobPos) {
            touchBlobPos = touchBlobPos.lerp(touchBlobDesiredPos, 0.2)

            context.beginPath()
            context.fillStyle = "rgba(0, 0, 255, 0.5)"
            context.arc(touchBlobPos.x, touchBlobPos.y, sizingFactor * 0.1, 0, 2 * Math.PI, false)
            context.fill()
        }

        for (let connection of gameState.board.connectionScreenPos) {
            if (connection.deviceIndex != gameState.deviceIndex) {
                continue
            }

            context.beginPath()
            context.lineWidth = sizingFactor * 0.1
            context.moveTo(connection.start.x, connection.start.y)
            context.lineTo(connection.end.x, connection.end.y)
            context.strokeStyle = "blue"
            context.lineCap = "round"
            context.stroke()
        }

        gameState.board.phones.drawDebug("blue")
    }

    render(gameState) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        context.clearRect(0, 0, canvas.width, canvas.height)

        if (gameState.phase == gamePhase.BUILDING) {
            this.renderBuilding(gameState)
        }
    }
}