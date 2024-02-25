const canvas = document.getElementById("fullscreen-canvas")
const context = canvas.getContext("2d")

let gameState = null
let session = null
let renderer = null

let touchBlobDesiredPos = null
let touchBlobPos = null

function clampToSide(screenPos) {
    const borderRegion = 100

    const newPos = screenPos.copy()

    if (newPos.x <= borderRegion) {
        newPos.x = 0
    } else if (newPos.x >= canvas.width - borderRegion) {
        newPos.x = canvas.width
    }

    if (newPos.y <= borderRegion) {
        newPos.y = 0
    } else if (newPos.y >= canvas.height - borderRegion) {
        newPos.y = canvas.height
    }

    return newPos
}

let tempTouchUpdate = null
canvas.addEventListener("touchstart", event => {
    if (!gameState) return

    tempTouchUpdate = new Update(updateType.TOUCH,
        Date.now(), gameState.deviceIndex, {
            touchDown: clampToSide(Vector2d.fromTouchEvent(event, canvas)),
            touchUp: null,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        })

    touchBlobDesiredPos = clampToSide(Vector2d.fromTouchEvent(event, canvas))
    touchBlobPos = touchBlobDesiredPos
})

canvas.addEventListener("touchmove", event => {
    touchBlobDesiredPos = clampToSide(Vector2d.fromTouchEvent(event, canvas))
})

canvas.addEventListener("touchend", event => {
    if (!gameState || !tempTouchUpdate) return

    tempTouchUpdate.data.touchUp = clampToSide(Vector2d.fromTouchEvent(event, canvas))
    session.sendUpdate(gameState, tempTouchUpdate)
    tempTouchUpdate = null
    
    touchBlobPos = null
})

function gameLoop() {
    const updates = session.getUpdates()
    gameState.processUpdates(updates)
    renderer.render(gameState)

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

    renderer = new Renderer()

    if (deviceIndex == 0) {
        MenuGui.show()
    }

    gameLoop()
}

canvas.onclick = () => {
    if (document.fullscreenElement != canvas) {
        canvas.requestFullscreen()
    }
}

main()