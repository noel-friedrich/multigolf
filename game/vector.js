function angleDifference(a, b) {
    var diff = a - b
    while (diff < -Math.PI/2) diff += Math.PI
    while (diff > Math.PI/2) diff -= Math.PI
    return diff
}

class Vector3d {

    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    get length() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
    }

    get normalized() {
        return this.div(this.length)
    }

    get array() {
        return [this.x, this.y, this.z]
    }

    get min() {
        return Math.min(...this.array)
    }

    get max() {
        return Math.max(...this.array)
    }

    copy() {
        return new Vector3d(this.x, this.y, this.z)
    }

    add(other) {
        return new Vector3d(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        )
    }

    lerp(other, t) {
        return this.add(other.sub(this).mul(t))
    }

    distanceTo(other) {
        return this.sub(other).length
    }

    mul(scalar) {
        return new Vector3d(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        )
    }

    sub(other) {
        return this.add(other.mul(-1))
    }

    div(scalar) {
        return this.mul(1 / scalar)
    }

    cross(other) {
        return new Vector3d(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        )
    }

    dot(other) {
        return (
            this.x * other.x +
            this.y * other.y +
            this.z * other.z
        )
    }

    get angleX() {
        return Math.atan2(this.z, this.y)
    }

    rotateX(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x,
            this.y * cos - this.z * sin,
            this.y * sin + this.z * cos
        )
    }

    setAngleX(angle) {
        return this.rotateX(angle - this.angleX)
    }

    get angleY() {
        return Math.atan2(this.z, this.x)
    }

    rotateY(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x * cos - this.z * sin,
            this.y,
            this.x * sin + this.z * cos
        )
    }

    setAngleY(angle) {
        return this.rotateY(angle - this.angleY)
    }

    get angleZ() {
        return Math.atan2(this.y, this.x)
    }

    rotateZ(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.z
        )
    }

    setAngleZ(angle) {
        return this.rotateZ(angle - this.angleZ)
    }

    rotateUp(angle) {
        let temp = this.angleZ
        return this.setAngleZ(0).rotateY(angle).setAngleZ(temp)
    }

    setAngleUp(angle) {
        let temp = this.angleZ
        return this.setAngleZ(0).setAngleY(angle).setAngleZ(temp)
    }

    get angleUp() {
        return this.setAngleZ(0).angleY
    }

    rotateRight(angle) {
        return this.rotateZ(angle)
        let temp = this.angleUpS
        return this.setAngleUp(0).rotateZ(angle).setAngleUp(temp)
    }

    apply(func) {
        return new Vector3d(
            func(this.x),
            func(this.y),
            func(this.z)
        )
    }

    round() {
        return this.apply(Math.round)
    }

    floor() {
        return this.apply(Math.floor)
    }

    angleTo(v) {
        return Math.acos(this.dot(v)/(this.length*v.length()))
    }
}

class Vector2d {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static get zero() {
        return new Vector2d(0, 0)
    }

    static fromFunc(f) {
        return new Vector2d(f(0), f(1))
    }

    copy() {
        return new Vector2d(this.x, this.y)
    }

    add(v) {
        return new Vector2d(this.x + v.x, this.y + v.y)
    }

    iadd(v) {
        this.x += v.x
        this.y += v.y
    }

    sub(v) {
        return new Vector2d(this.x - v.x, this.y - v.y)
    }

    isub(v) {
        this.x -= v.x
        this.y -= v.y
    }

    mul(v) {
        return new Vector2d(this.x * v.x, this.y * v.y)
    }

    imul(v) {
        this.x *= v.x
        this.y *= v.y
    }

    div(v) {
        return new Vector2d(this.x / v.x, this.y / v.y)
    }

    idiv(v) {
        this.x /= v.x
        this.y /= v.y
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    get normalized() {
        let m = this.length
        return new Vector2d(this.x / m, this.y / m)
    }
    
    scale(x) {
        return new Vector2d(this.x * x, this.y * x)
    }

    lerp(v, t) {
        let delta = v.sub(this)
        return this.add(delta.scale(t))
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    iscale(x) {
        this.x *= x
        this.y *= x
    }

    distance(v) {
        return this.sub(v).length
    }

    cross(v) {
        return this.x * v.y - this.y * v.x
    }

    static fromAngle(angle) {
        return new Vector2d(Math.cos(angle), Math.sin(angle))
    }

    static fromObject(obj) {
        return new Vector2d(obj.x, obj.y)
    }

    static fromPolar(mag, angle) {
        return new Vector2d(mag * Math.cos(angle), mag * Math.sin(angle))
    }

    static fromArray(arr) {
        return new Vector2d(arr[0], arr[1])
    }

    set(x, y) {
        this.x = x
        this.y = y
    }

    addX(x) {
        return new Vector2d(this.x + x, this.y)
    }

    addY(y) {
        return new Vector2d(this.x, this.y + y)
    }

    rotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        return new Vector2d(x, y)
    }

    irotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        this.x = x
        this.y = y
    }

    static random() {
        let direction = Math.random() * Math.PI * 2
        return Vector2d.fromAngle(direction)
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    angleDifference(v) {
        return angleDifference(this.angle, v.angle)
    }

    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x)
    }

    equals(v) {
        return this.x == v.x && this.y == v.y
    }

    map(f) {
        return new Vector2d(f(this.x), f(this.y))
    }

    product() {
        return this.x * this.y
    }

    get array() {
        return [this.x, this.y]
    }

    get min() {
        return Math.min(...this.array)
    }

    get max() {
        return Math.max(...this.array)
    }

    toArray() {
        return [this.x, this.y]
    }

    normalizeToCanvas(canvas) {
        return new Vector2d(
            this.x / canvas.width,
            this.y / canvas.height
        )
    }

    static fromTouchEvent(event, element) {
        let x = 0, y = 0

        if (event.touches && event.touches[0]) {
            x = event.touches[0].clientX
            y = event.touches[0].clientY
        } else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
            x = event.originalEvent.changedTouches[0].clientX
            y = event.originalEvent.changedTouches[0].clientY
        } else if (event.clientX && event.clientY) {
            x = event.clientX
            y = event.clientY
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX
            y = event.changedTouches[0].clientY
        }

        const rect = element.getBoundingClientRect()
        return new Vector2d(x - rect.left, y - rect.top)
    }

}