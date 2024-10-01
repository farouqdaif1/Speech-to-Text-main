import React, { useEffect, useState } from "react";

const RecordingTimer = ({ recording, pause }) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let timer;
        if (recording && !pause) {
            timer = setInterval(() => {
                setDuration((prevDuration) => prevDuration + 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [recording, pause]);

    useEffect(() => {
        if (!recording) {
            setDuration(0);
        }
    }, [recording]);

    const formatDuration = (duration) => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <span className="text-2xl font-motiva-light">
            <span className="font-bold text-3xl" style={{ color: "#608CFE" }}>
                {formatDuration(duration)}
            </span>
        </span>
    );
};

export default RecordingTimer;
