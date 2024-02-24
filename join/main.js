async function registerDevice(gameUid) {
    const response = await fetch(`https://34.253.67.27/join_game_session/${gameUid}`)
    const data = await response.json()
    console.log(response, data)

    if (!data.session_exists) {
        location.href = "../welcome/index.html?error&error-type=unknown_session"
    } else if (data.game_started) {
        location.href = "../welcome/index.html?error&error-type=game_already_started"
    }

    return data.assigned_device_index
}

async function gameHasStarted(gameUid) {
    const response = await fetch(`https://34.253.67.27/game_started/${gameUid}`)
    const data = await response.json()
    return data.game_started
}

async function main() {
    const urlParams = new URLSearchParams(location.search)
    if (!urlParams.has("g")) {
        location.href = "../welcome/index.html?error&error-type=join-gameuid-missing"
        return
    }

    const gameUid = urlParams.get("g")
    const deviceIndex = await registerDevice(gameUid)
    console.log(deviceIndex)

    setInterval(async () => {
        if (await gameHasStarted(gameUid)) {
            location.href = `../game/index.html?g=${encodeURIComponent(gameUid)}&i=${encodeURIComponent(deviceIndex)}`
        }
    }, 1000)
}

main()