class Renderer {

    render(gameState) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        gameState.board.phones.drawDebug("blue")
    }
}