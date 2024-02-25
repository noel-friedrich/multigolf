const gamePhase = {
    BUILDING: 0,
    PLACING_START: 1,
    PLACING_HOLE: 2,
    PLAYING: 3
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