import { useEffect, useState } from "react";

function formatHHMMSS(ms) {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TopBarTimer({ startTime }) {
    const [elapsed, setElapsed] = useState("00:00:00");

    useEffect(() => {
        if (!startTime) {
            setElapsed("00:00:00");
            return;
        }

        const start = startTime instanceof Date ? startTime : new Date(startTime);
        if (isNaN(start.getTime())) {
            console.error("TopBarTimer: invalid startTime:", startTime);
            setElapsed("00:00:00");
        return;
        }

        const update = () => {
            const nowMs = Date.now();
            const elapsedMs = nowMs - start.getTime();
            setElapsed(formatHHMMSS(elapsedMs));
        };

        // Run once immediately then every second
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [startTime]);

    return <span>{elapsed}</span>;
}
