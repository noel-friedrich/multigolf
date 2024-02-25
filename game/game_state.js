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
        this.updateUids = new Set()
    }

    processUpdates(updates) {
        updates = updates.filter(u => !this.updateUids.has(u.uid))
        if (updates.length == 0) return
        console.log("processing updates", updates)
        this.board.processUpdates(this, updates)
        for (let update of updates) {
            this.updateUids.add(update.uid)
        }
    }

}