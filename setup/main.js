async function prepareGame() {
    /* 
        const response = await fetch("http://83.135.188.29:1520/create_game_session")
        const data = await response.json()
        console.log(response, data)
    */

    // parse gameUid and return it

    return "dummy"
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
    joinQrcodeImg.src = getQRSource(gameUid)
}

main()