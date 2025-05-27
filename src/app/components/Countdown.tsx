"use client";

import {useEffect, useState} from "react";

const Countdown = ({seconds = 5, onComplete} : {seconds?:
    number; onComplete?: () => void }) => {
        const[timeLeft, setTimeLeft] = useState(seconds);
        const[visible, setVisible] =useState(true);

        useEffect(() => {
            if (timeLeft ===0) {
                setVisible(false);
                if (onComplete) onComplete();
                return;
            }

            const timer = setTimeout (() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }, [timeLeft, onComplete]);

        if (!visible) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1f44] bg-opacity-80 text-white text-4xl
            font-bold">
                Starting in {timeLeft}...
            </div>
        );
    };

    export default Countdown;