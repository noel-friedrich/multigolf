const canvas = document.getElementById("fullscreen-canvas")
const context = canvas.getContext("2d")

let gameState = null
let session = null

let tempTouchUpdate = null
canvas.addEventListener("touchstart", event => {
    if (!gameState) return

    tempTouchUpdate = new Update(updateType.TOUCH,
        Date.now(), gameState.deviceIndex, {
            touchDown: Vector2d.fromTouchEvent(event, canvas),
            touchUp: null
        })
})

canvas.addEventListener("touchend", event => {
    if (!gameState || !tempTouchUpdate) return

    tempTouchUpdate.touchUp = Vector2d.fromTouchEvent(event, canvas)
    session.sendUpdate(tempTouchUpdate)
    tempTouchUpdate = null
})

function gameLoop() {
    const updates = session.getUpdates()
    gameState.processUpdates(updates)

    window.requestAnimationFrame(gameLoop)
}

async function main() {
    const urlParams = new URLSearchParams(location.search)
    if (!urlParams.has("g") || !urlParams.has("i")) {
        location.href = "../welcome/index.html?error&error-type=game-param-missing"
        return
    }

    const gameUid = urlParams.get("g")
    const deviceIndex = urlParams.get("i")
    gameState = new GameState(gameUid, deviceIndex)

    session = new Session()
    await session.login(gameState)

    gameLoop()
}

main()