
class AccelData {
    constructor(x,y,z, timeStamp) {
        this.vector = new Vector3d(x,y,z)
        this._timeStamp = timeStamp
    }

    static fromValues(x,y,z) {
        return new AccelData(x,y,z, Date.now())
    }

    static fromAccelerometer(accel) {
        return new AccelData(accel.x, accel.y, accel.z, Date.now())
    }

    static fromData(accel) {
        return new AccelData(accel.x, accel.y, accel.z, accel._timeStamp)
    }

    get timeStamp() {
        return this._timeStamp
    }

    static similarity(accelDataA, accelDataB) {
        const angle = accelDataA.vector.angleTo(accelDataB.vector)
        return ((angle) * (1)) / (Math.PI) // map to 0 to 1
    }

}

class AccelReader {

    constructor() {
        this.isEnabled = false
        this.lastAccelData = null
        try {
            this.accel = new Accelerometer({ frequency: 60 })
            this.accel.addEventListener("reading", this.handleReading)
            this.lastAccelData = AccelData.fromAccelerometer(this.accel)
            this.isEnabled = true
        } catch (_) {
            this.accel = null
        }
        this.changed = false
    }

    get hasChanged() {
        return this.changed
    }

    handleReading() {
        if (!this.isEnabled) return
        const currTime = Date.now()
        if (currTime - this.lastAccelData.timeStamp() < 500) {
            return
        }

        const current_accel = AccelData.fromAccelerometer(this.accel)
        this.debugPrint()
        console.log(current_accel)
        if (!this.didChange(this.lastAccelData, current_accel)) {
            this.changed = false
            return
        }
        this.changed = true
        this.changed = true
        this.lastAccelData = current_accel
    }

    debugPrint() {
        this.accel.addEventListener("reading", () => {
            console.log(`Acceleration along the X-axis ${this.accel.x}`)
            console.log(`Acceleration along the Y-axis ${this.accel.y}`)
            console.log(`Acceleration along the Z-axis ${this.accel.z}`)
        });
    }

    didChange(accelDataA, accelDataB) {
        if(!this.isEnabled) return
        const difference = accelDataA.similarity(accelDataB) * 100 // is percent (100 is same)
        return difference < 50 //TODO: tweak this number
    }

    pullAccelerometer() {
        return this.lastAccelData
    }
}
