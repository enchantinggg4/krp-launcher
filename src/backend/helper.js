const singleMap = {}

export const isContextRunning = (name) => singleMap[name]
export const useSingleContext = async (name, run) => {
    const used = singleMap[name]
    if (used) {
        // Already running
        return singleMap[name];
    }

    singleMap[name] = new Promise((resolve, reject) => {
        run().then(resolve).catch(reject).finally(() => singleMap[name] = null);
    });

    return singleMap[name];
}