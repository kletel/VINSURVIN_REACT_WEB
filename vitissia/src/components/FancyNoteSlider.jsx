import { useMemo } from 'react';

const FancyNoteSlider = ({ value, onChange, min = 84, max = 100 }) => {
    const percent = useMemo(() => {
        if (max === min) return 0;
        return ((value - min) / (max - min)) * 100;
    }, [value, min, max]);

    return (
        <div className="relative flex-1">
            {/* bulle flottante */}
            <div
                className="absolute -top-9 translate-x-[-50%] transition-all duration-200 ease-out"
                style={{ left: `${percent}%` }}
            >
                <div className="px-2 py-1 text-xs font-semibold bg-indigo-500 text-white rounded-md shadow-md animate-pulse">
                    {value}
                </div>
                <div className="w-2 h-2 bg-indigo-500 rotate-45 mx-auto -mt-1" />
            </div>

            {/* slider */}
            <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full appearance-none bg-transparent cursor-pointer"
                style={{
                    background: `linear-gradient(90deg, #4f46e5 ${percent}%, rgba(79,70,229,0.15) ${percent}%)`,
                    height: '4px',
                    borderRadius: '9999px',
                }}
            />

            <style jsx>{`
                input[type='range'] {
                outline: none;
                }
                input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 9999px;
                background: white;
                border: 3px solid #4f46e5;
                box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
                transition: transform 0.15s ease-out;
                }
                input[type='range']::-webkit-slider-thumb:active {
                transform: scale(1.05);
                }
                input[type='range']::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 9999px;
                background: white;
                border: 3px solid #4f46e5;
                box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
                transition: transform 0.15s ease-out;
                }
                input[type='range']::-moz-range-thumb:active {
                transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default FancyNoteSlider;