
class AccelData {
    constructor(x,y,z, timeStamp) {
        this.vector = Vector3d(x,y,z)
        this._timeStamp = timeStamp
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
        this.accel = new Accelerometer({ frequency: 60 })
        this.lastAccelData = AccelData.fromAccelerometer(this.accel)
        this.changed = false
        this.accel.addEventListener("reading", this.handleReading)
    }

    get hasChanged() {
        return this.changed
    }

    handleReading() {
        const currTime = Date.now()
        if (currTime - this.lastAccelData.timeStamp() < 500) {
            return
        }

        const current_accel = AccelData.fromAccelerometer(this.accel)
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
        const difference = accelDataA.similarity(accelDataB) * 100 // is percent (100 is same)
        return difference < 50 //TODO: tweak this number
    }

    pullAccelerometer() {
        return this.lastAccelData
    }
}
