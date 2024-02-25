const canvas = document.getElementById("fullscreen-canvas")
const context = canvas.getContext("2d")

let gameState = null
let session = null
let renderer = null

let touchBlobDesiredPos = null
let touchBlobPos = null
let activeTouchPos = null

let ballShootAngle = null
let ballShootStrength = null

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

canvas.addEventListener("click", event => {
    if (!gameState.board.startPos) {
        return
    }

    const screenPos = Vector2d.fromTouchEvent(event, canvas)
    const startScreenPos = gameState.board.boardPosToScreenPos(gameState.board.startPos)
    if (screenPos.distance(startScreenPos) < 30) {
        session.sendUpdate(gameState, new Update(
            updateType.SPAWN_BALL, Date.now(), gameState.deviceIndex, {
                color: `hsl(${Math.floor(Math.random() * 360)}deg, 100%, 50%)`
            }
        ))
    }
})

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
    activeTouchPos = Vector2d.fromTouchEvent(event, canvas)

    ballShootAngle = null
    ballShootStrength = null
})

canvas.addEventListener("touchmove", event => {
    touchBlobDesiredPos = clampToSide(Vector2d.fromTouchEvent(event, canvas))
    activeTouchPos = Vector2d.fromTouchEvent(event, canvas)
})

canvas.addEventListener("touchend", event => {
    if (!gameState || !tempTouchUpdate) return

    if (ballShootAngle && ballShootStrength && !(gameState.board.ballVel && gameState.board.ballVel.length > 0)) {
        session.sendUpdate(gameState, new Update(
            updateType.KICK_BALL, Date.now(), gameState.deviceIndex, {
                strength: ballShootStrength,
                angle: ballShootAngle
            }
        ))

        tempTouchUpdate = null
        touchBlobPos = null
        activeTouchPos = null
    } else {
        tempTouchUpdate.data.touchUp = clampToSide(Vector2d.fromTouchEvent(event, canvas))
        session.sendUpdate(gameState, tempTouchUpdate)
        tempTouchUpdate = null
        
        touchBlobPos = null
        activeTouchPos = null
    }
})

function sendAccelerometerUpdate(gameState) {
    const accel = gameState.board.accelerometer.pullAccelerometer()
    if (!accel.hasChanged) {
        return
    }
    session.sendUpdate(gameState, new Update(
        updateType.SLOPE, Date.now(), gameState.deviceIndex, {
            accelerometer: accel
        }
    ))
    console.log(accel)
}

function gameLoop() {
    const updates = session.getUpdates()
    gameState.processUpdates(updates)

    if (gameState.phase == gamePhase.PLAYING) {
        gameState.board.updatePhysics()
        sendAccelerometerUpdate(gameState);
    }

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

document.body.onclick = () => {
    if (document.fullscreenElement != document.body) {
        document.body.requestFullscreen()
    }
}

main()