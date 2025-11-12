import React, { useEffect, useMemo, useRef, useState, memo } from "react";

const FancyNoteSlider = ({ value, onChange, min = 84, max = 100 }) => {
    const [local, setLocal] = useState(Number(value ?? min));
    const rafRef = useRef(0);

    useEffect(() => {
        setLocal(Number(value ?? min));
    }, [value, min]);

    const percent = useMemo(() => {
        const v = Math.min(Math.max(local, min), max);
        return ((v - min) / (max - min)) * 100;
    }, [local, min, max]);

    const handleInput = (e) => {
        const v = Number(e.target.value);
        setLocal(v); 
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            onChange?.(v); 
        });
    };

    return (
        <div className="relative flex-1">
            <div
                className="absolute -top-9 -translate-x-1/2"
                style={{
                    left: `${percent}%`,
                    willChange: "left, transform",
                    transition: "left 80ms linear", // ou retire carrément pour 0 lag
                }}
            >
                <div className="px-2 py-1 text-xs font-semibold bg-indigo-500 text-white rounded-md shadow-md">
                    {local}
                </div>
                <div className="w-2 h-2 bg-indigo-500 rotate-45 mx-auto -mt-1" />
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={local}
                onInput={handleInput}   // plus réactif que onChange
                className="w-full appearance-none bg-transparent cursor-pointer"
                style={{
                    background: `linear-gradient(90deg, #4f46e5 ${percent}%, rgba(79,70,229,0.15) ${percent}%)`,
                    height: "4px",
                    borderRadius: "9999px",
                }}
            />

            <style>{`
        input[type='range'] { outline: none; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; height: 20px; width: 20px; border-radius: 9999px;
          background: white; border: 3px solid #4f46e5;
          box-shadow: 0 10px 25px rgba(79,70,229,0.35);
          transition: transform 0.1s ease-out;
        }
        input[type='range']::-webkit-slider-thumb:active { transform: scale(1.05); }
        input[type='range']::-moz-range-thumb {
          height: 20px; width: 20px; border-radius: 9999px; background: white;
          border: 3px solid #4f46e5; box-shadow: 0 10px 25px rgba(79,70,229,0.35);
          transition: transform 0.1s ease-out;
        }
        input[type='range']::-moz-range-thumb:active { transform: scale(1.05); }
      `}</style>
        </div>
    );
};

export default memo(FancyNoteSlider);