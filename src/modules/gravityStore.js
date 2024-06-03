import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError, logInfo } from '@/modules/logger'

export class Gravity {
    constructor(id, temperature, gravity, angle, battery, rssi, corrGravity, runTime, created, batchId) {
        this.id = id
        this.temperature = temperature
        this.gravity = gravity
        this.angle = angle
        this.battery = battery
        this.rssi = rssi
        this.corrGravity = corrGravity
        this.runTime = runTime
        this.created = created
        this.batchId = batchId
    }

    static fromJson(g) {
        return new Gravity(g.id, g.temperature, g.gravity, g.angle, g.battery, g.rssi, g.corrGravity, g.runTime, g.created, g.batchId)
    }

    toJson() {
        return {
            "id": this.id,
            "temperature": this.temperature,
            "gravity": this.gravity,
            "angle": this.angle,
            "battery": this.battery,
            "rssi": this.rssi,
            "corrGravity": this.corrGravity,
            "runTime": this.runTime,
            "created": this.created,
            "batchId": this.batchId,
        }
    }

    get id() { return this._id }
    get temperature() { return this._temperature }
    get gravity() { return this._gravity }
    get angle() { return this._angle }
    get battery() { return this._battery }
    get rssi() { return this._rssi }
    get corrGravity() { return this._corrGravity }
    get runTime() { return this._runTime }
    get created() { return this._created }
    get batchId() { return this._batchId }

    set id(id) { this._id = id }
    set temperature(temperature) { this._temperature = temperature }
    set gravity(gravity) { this._gravity = gravity }
    set angle(angle) { this._angle = angle }
    set battery(battery) { this._battery = battery }
    set rssi(rssi) { this._rssi = rssi }
    set corrGravity(corrGravity) { this._corrGravity = corrGravity }
    set runTime(runTime) { this._runTime = runTime }
    set created(created) { this._created = created }
    set batchId(batchId) { this._batchId = batchId }
}

export const useGravityStore = defineStore('gravityStore', {
    state: () => {
        return { gravity: [] }
    },
    actions: {
        getGravityListForBatch(id, callback) {
            // callback => (success, gravity[])

            logDebug("gravityStore.getGravityListForBatch()")
            global.disabled = true
            fetch(global.baseURL + 'api/batch/' + id, {
                method: "GET",
                headers: { "Authorization": global.token },
                signal: AbortSignal.timeout(global.fetchTimout),
            })
                .then(res => {
                    logDebug("gravityStore.getGravityListForBatch()", res.status)
                    if (!res.ok) throw res
                    return res.json()
                })
                .then(json => {
                    this.gravity = []

                    json.gravity.forEach(g => {
                        var gravity = Gravity.fromJson(g)
                        this.gravity.push(gravity)
                    });

                    callback(true, this.gravity)
                    global.disabled = false
                })
                .catch(err => {
                    global.disabled = false
                    logError("gravityStore.getGravityListForBatch()", err)
                    callback(false, [])
                })
        },
    }
})