import * as React from "react"

/**
 * Creates a throttled function that only invokes the callback at most once
 * every `throttleMs` milliseconds. The throttled function captures the latest
 * arguments and uses them for the trailing invocation.
 *
 * @param callback - The function to throttle
 * @param throttleMs - The throttle time in milliseconds
 * @returns A throttled version of the callback
 */
export function useThrottledCallback(
    callback: (...args: any[]) => void,
    throttleMs: number
): (...args: any[]) => void {
    // Store the latest callback reference
    const callbackRef = React.useRef(callback)
    callbackRef.current = callback

    // Track last invocation time
    const lastCall = React.useRef(0)
    // Track timeout ID for trailing calls
    const timeoutId = React.useRef<number | null>(null)
    // Store latest arguments for trailing calls
    const lastArgs = React.useRef<any[] | null>(null)

    const throttledFn = React.useCallback((...args: any[]) => {
        lastArgs.current = args
        const now = Date.now()
        const timeSinceLast = now - lastCall.current
        const remaining = throttleMs - timeSinceLast

        // Execute immediately if throttle time has passed
        if (remaining <= 0) {
            if (timeoutId.current !== null) {
                clearTimeout(timeoutId.current)
                timeoutId.current = null
            }
            lastCall.current = now
            callbackRef.current(...args)
        }
        // Schedule trailing call if no pending execution
        else if (timeoutId.current === null) {
            timeoutId.current = window.setTimeout(() => {
                lastCall.current = Date.now()
                callbackRef.current(...lastArgs.current!)
                timeoutId.current = null
            }, remaining)
        }
    }, [throttleMs])

    // Cleanup pending timeouts on unmount or throttleMs change
    React.useEffect(() => {
        return () => {
            if (timeoutId.current !== null) {
                clearTimeout(timeoutId.current)
                timeoutId.current = null
            }
        }
    }, [throttleMs])

    return throttledFn
}