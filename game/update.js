const updateType = {
    FINGER_MOVE: "finger_move"
}

class Update {

    constructor(type, timestamp, index, data) {
        this.type = type // {} of updateType
        this.timestamp = timestamp // ms since 01.01.1970
        this.index = index // phone index
        this.data = data // generic {} containing data (e.g. finger positions)
                         // data needs to be seriazable!!
    }

    toObject() {
        return {
            type: this.type,
            timestamp: this.timestamp,
            index: this.index,
            data: this.data
        }
    }

    toJSON() {
        return JSON.stringify(this.toObject())
    }

    static fromObject(obj) {
        return new Update(
            obj.type, obj.timestamp,
            obj.index, obj.data
        )
    }

    static fromJSON(jsonString) {
        return Update.fromObject(JSON.parse(jsonString))
    }

    static parseUpdateList(jsonString) {
        const data = JSON.parse(jsonString)
        if (!Array.isArray(data)) {
            throw new Error("Data format wrong ??")
        }

        return data.map(updateData => Update.fromObject(updateData))
    }

}