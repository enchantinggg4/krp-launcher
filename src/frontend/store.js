import { makeObservable, observable } from 'mobx'
import { setToken } from './config'

class Store {

    token = undefined

    isRunning = false
    isPrepared = false

    constructor() {
        makeObservable(this, {
            token: observable,
            isRunning: observable,
            isPrepared: observable
        })

        window.Main.on('update_config', d => {
            this.token = d.token
            setToken(this.token)
        })

        window.Main.on('game_running', d => {
            this.isRunning = d;
        })

        window.Main.on('is_prepared', d => {
            this.isPrepared = d;
        })
    }

}

export default new Store();