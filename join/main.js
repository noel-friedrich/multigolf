async function registerDevice(gameUid) {
    // register device with backend
    // and return index of this device
    return Math.floor(Math.random() * 10000)
}

async function gameHasStarted(gameUid) {
    // return if game has started by
    // checking with backend data
    return false
}

async function main() {
    const urlParams = new URLSearchParams(location.search)
    if (!urlParams.has("g")) {
        location.href = "../welcome/index.html?error&error-type=join-gameuid-missing"
        return
    }

    const gameUid = urlParams.get("g")
    const deviceIndex = await registerDevice(gameUid)

    setInterval(async () => {
        if (await gameHasStarted()) {
            location.href = `../game/index.html?g=${encodeURIComponent(gameUid)}&i=${encodeURIComponent(deviceIndex)}`
        }
    }, 1000)
}

main()