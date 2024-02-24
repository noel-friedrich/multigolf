class Session {

    // create and manage session with backend 
    // to communicate changes

    // (init socket connection)

    socketAddress = "https://34.253.67.27"

    constructor() {
        this.socket = null
        this.tempUpdates = []
    }

    async login(gameState) {
        this.socket = io(this.socketAddress)

        this.socket.on("connected_to_game_session", data => {
            if (!data.game_session_exists) {
                location.href = "../welcome/index.html?error&error-type=game_session_doesnt_exist"
            }

            const updates = Update.parseUpdateList(data.updates)
            this.tempUpdates.push(...updates)
        })

        this.socket.emit("login", {
            game_session_id: gameState.gameUid
        })

        this.socket.on("update", updateData => {
            const update = Update.fromObject(updateData)
            this.tempUpdates.push(update)
        })
    }

    sendUpdate(gameState, update) {
        this.socket.emit("update", {
            game_session_id: gameState.gameUid,
            update: update.toObject()
        })
    }

    getUpdates() {
        const updates = this.tempUpdates
        this.tempUpdates = []
        return updates
    }

}