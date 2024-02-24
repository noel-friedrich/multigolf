const updateType = {
    FINGER_MOVE: "finger_move"
}

class Update {

    constructor(type, timestamp, index, data) {
        this.type = type // {} of updateType
        this.timestamp = timestamp // ms since 01.01.1970
        this.index = index // phone index
        this.data = data // generic {} containing data (e.g. finger positions)
    }

}