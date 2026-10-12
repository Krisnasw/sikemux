import { useEffect, useRef, type DependencyList } from "react";
import type { PluginStream } from "./backend";

export interface StreamLife {
    /** What the stream follows is over: it is not opened again, even when the app shows again. */
    finish(): void;
    /** The stream ended before what it follows did; it opens again after the `retry` delay, if there is one. */
    ended(): void;
}

export interface VisibleStreamOptions {
    /** Close the stream while the app is hidden and open it again once it shows. */
    readonly pauseWhenHidden: boolean;
    /** How long to wait before opening again a stream that `ended`, by how many times in a row it has. */
    readonly retry?: (tries: number) => number;
}

/**
 * Keeps one stream open while `start` is given, opening it again when `deps` change. `start` opens the stream and
 * tells it, through `life`, when it is over for good or ended early.
 */
export function useVisibleStream(start: ((life: StreamLife) => PluginStream) | null, deps: DependencyList, options: VisibleStreamOptions): void {
    const latest = useRef({ start, options });
    latest.current = { start, options };
    const enabled = start !== null;

    useEffect(() => {
        if (!enabled) return;
        let open: PluginStream | null = null;
        let over = false;
        let tries = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const close = () => {
            clearTimeout(timer);
            timer = undefined;
            open?.stop();
            open = null;
        };
        const hidden = () => latest.current.options.pauseWhenHidden && document.hidden;
        const begin = () => {
            const opener = latest.current.start;
            if (over || open || timer !== undefined || !opener || hidden()) return;
            let stream: PluginStream | null = null;
            stream = opener({
                finish: () => {
                    over = true;
                    if (open === stream) close();
                },
                ended: () => {
                    if (open !== stream) return;
                    open = null;
                    const retry = latest.current.options.retry;
                    if (over || !retry) return;
                    timer = setTimeout(() => {
                        timer = undefined;
                        begin();
                    }, retry(tries++));
                },
            });
            open = over ? null : stream;
            if (over) stream.stop();
        };
        const onVisibility = () => {
            if (hidden()) close();
            else begin();
        };

        begin();
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            over = true;
            document.removeEventListener("visibilitychange", onVisibility);
            close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller's deps decide when the stream is opened again
    }, [enabled, ...deps]);
}
