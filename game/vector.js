function angleDifference(a, b) {
    var diff = a - b
    while (diff < -Math.PI/2) diff += Math.PI
    while (diff > Math.PI/2) diff -= Math.PI
    return diff
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

}