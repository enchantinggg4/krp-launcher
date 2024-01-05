export const electronProxy = new Proxy({}, {
    get(target, name, receiver) {
        return (...args) => {
            window.Main.call(name, args)
        }
    }
})

window.api = electronProxy;