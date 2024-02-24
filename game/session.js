class Session {

    // create and manage session with backend 
    // to communicate changes

    // (init socket connection)

    socketAddress = "johanns-server"

    constructor() {
        this.socket = null
        this.tempUpdates = null
    }

    async login(gameState) {
        this.socket = new WebSocket(this.socketAddress)

        this.socket.send(JSON.stringify({
            type: "login",
            deviceIndex: gameState.deviceIndex,
            gameUid: gameState.gameUid
        }))

        this.socket.addEventListener("message", event => {
            const updates = Update.parseUpdateList(event.data)
            this.tempUpdates.push(...updates)
        })
    }

    sendUpdate(update) {
        this.socket.send(JSON.stringify({
            type: "update",
            update: update.toObject()
        }))
    }

    getUpdates() {
        const updates = this.tempUpdates
        this.tempUpdates = []
        return updates
    }

}