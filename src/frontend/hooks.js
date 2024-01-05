import { useEffect, useState } from "react"

export const useEvent = (name, defState) => {
    const [data, setData] = useState(defState)
    useEffect(() => {
        window.Main.on(name, setData)

        return () => window.Main.removeListener(name, setData)
    }, [])

    return data
}

export const useEventCallback = (name, callback) => {
    useEffect(() => {
        window.Main.on(name, callback)

        return () => window.Main.removeListener(name, callback)
    }, [])
}