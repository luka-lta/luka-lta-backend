import { DateTime } from "luxon";
import { useEffect, useState } from "react";

/** How often time-dependent UI (sun position, "now" marker) re-renders. */
const NOW_TICK_MS = 60_000;

/** Current time that updates once a minute — weather data itself only changes every few minutes. */
export function useNow(): DateTime {
    const [now, setNow] = useState(() => DateTime.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(DateTime.now()), NOW_TICK_MS);
        return () => window.clearInterval(timer);
    }, []);

    return now;
}
