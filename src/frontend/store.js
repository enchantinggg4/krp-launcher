import { makeObservable, observable } from 'mobx'
import { UPDATER_URL, api, setToken } from './config'
import { electronProxy } from './ipc'

class Store {

    token = undefined
    profile = undefined

    isRunning = false
    isPrepared = false




    isInitialLoading = true

    constructor() {
        makeObservable(this, {
            token: observable,
            isRunning: observable,
            isPrepared: observable,
            profile: observable,
            isInitialLoading: observable
        })

        window.Main.on('update_config', d => {
            this.isInitialLoading = false

            if (this.token != d.token) {
                this.token = d.token
                setToken(this.token)
                this.loadMe();

                console.log('Update config ', d)
            }

        })

        window.Main.on('game_running', d => {
            this.isRunning = d;
        })

        window.Main.on('is_prepared', d => {
            this.isPrepared = d;
        })
    }

    async handleProfile(profile) {
        this.profile = profile
    }

    logout() {
        this.token = undefined
        api.deleteHeader('Authorization')
        this.profile = undefined
        electronProxy.updateConfig({
            token: undefined
        });
    }

    async loadMe() {
        await api.get('/auth/me').then(it => {
            if (it.ok)
                this.handleProfile(it.data)
            else
                this.logout()

        }).catch(e => {
            this.logout()
        });
    }

    async uploadSkin(file) {
        const data = new FormData();
        data.append("file", file);

        // IDK why api.post doesnt work and i dont seem to care as well
        const res = await fetch(`${UPDATER_URL}/user/setskin`, {
            method: 'POST',
            body: data,
            headers: {
                'authorization': `Bearer ${this.token}`
            }
        })
        await this.loadMe();

        return res.json()
    }
}

const store = new Store()
window.store = store;
export default store;
