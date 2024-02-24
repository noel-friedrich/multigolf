class Session {

    // create and manage session with backend 
    // to communicate changes

    // (init socket connection)

    static socketAddress = ""

    constructor() {
        this.socket = null
    }

    async login(gameState) {
        this.socket = new WebSocket(this.socketAddress)
    }

}