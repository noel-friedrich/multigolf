const gamePhase = {
    BUILDING: 0,
    PLAYING: 1
}

class GameState {

    constructor(gameUid, deviceIndex) {
        this.gameUid = gameUid
        this.deviceIndex = deviceIndex
        this.board = new MinigolfBoard()
        this.phase = gamePhase.BUILDING
        this.allUpdates = []
    }

    processUpdates(updates) {
        if (updates.length == 0) return
        console.log("processing updates", updates)
        this.board.processUpdates(this, updates)
        this.allUpdates.push(...updates)
    }

}