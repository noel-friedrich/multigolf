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
    }

    processUpdates(updates) {

    }

}