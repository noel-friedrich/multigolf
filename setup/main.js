const statusText = document.getElementById("status-text")

async function prepareGame() {
    return Math.random().toString().slice(2)

    const response = await fetch("http://83.135.188.29:1520/create_game_session")
    const data = await response.json()
    console.log(response, data)

    // parse gameUid and return itw
}

function getQRSource(gameUid) {
    let url = window.location.href.replace("setup", "join")
    url += `?g=${gameUid}`
    const qrApi = "https://chart.apis.google.com/chart?chs=500x500&cht=qr&chld=L&chl="
    return qrApi + encodeURIComponent(url)
}

let gameUid = null

async function startGame() {
    if (!gameUid) {
        return
    }

    // call start game on backend

    location.href = `../game/index.html?g=${encodeURIComponent(gameUid)}&i=0`
}

async function main() {
    gameUid = await prepareGame()

    const joinQrcodeImg = document.getElementById("join-qrcode-img")

    joinQrcodeImg.onload = () => {
        statusText.textContent = "You can now scan the QR code with all participating phones. If everyone has scanned the QR code, press on the 'Start Game' button below. Be aware that you can't add any more phones after this point, so make sure that everyone is connected. Have fun!"
    }

    joinQrcodeImg.src = getQRSource(gameUid)
}

main()