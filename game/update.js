const updateType = {
    TOUCH: "touch",
    PHASE: "phase",
    KICK_BALL: "kick_ball",
    SLOPE: "slope"
}

class Update {

    constructor(type, timestamp, index, data, uid=null) {
        this.type = type // {} of updateType
        this.timestamp = timestamp // ms since 01.01.1970
        this.index = index // phone index
        this.data = data // generic {} containing data (e.g. finger positions)
                         // data needs to be seriazable!!
        this.uid = uid ?? Math.random().slice(2)
    }

    toObject() {
        return {
            type: this.type,
            timestamp: this.timestamp,
            index: this.index,
            data: this.data,
            uid: this.uid,
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

    static parseUpdateList(data) {
        if (!Array.isArray(data)) {
            throw new Error("Data format wrong ??")
        }

        return data.map(updateData => Update.fromObject(updateData))
    }

}