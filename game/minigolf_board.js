class MinigolfBoard {

    constructor() {
        this.fieldPath = [] // [...Vector2d]
        this.allUpdates = []
    }

    processUpdates(updates) {
        this.allUpdates.push(...updates)
    }

}