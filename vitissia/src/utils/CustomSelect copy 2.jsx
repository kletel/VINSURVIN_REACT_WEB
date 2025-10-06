import React, { useState, useRef, useEffect } from "react";

const CustomSelect = ({ options, label, value, onChange, multiple = false, isNested = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const buttonRef = useRef(null);
    const listboxRef = useRef(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionSelect = (option) => {
        if (isNested && option.subOptions) {
            setExpandedIndex(expandedIndex === option.id ? null : option.id);
        } else {
            if (multiple) {
                const selectedValues = Array.isArray(value) ? value : [];
                if (selectedValues.includes(option)) {
                    onChange(selectedValues.filter((selected) => selected !== option));
                } else {
                    onChange([...selectedValues, option]);
                }
            } else {
                onChange(option);
                setIsOpen(false);
            }
        }
    };

    const handleKeyDown = (event) => {
        if (!isOpen) return;

        switch (event.key) {
            case "ArrowDown":
                if (expandedIndex !== null && options[expandedIndex].subOptions) {
                    setHighlightedIndex((prev) => (prev + 1) % options[expandedIndex].subOptions.length);
                } else {
                    setHighlightedIndex((prev) => (prev + 1) % options.length);
                }
                break;

            case "ArrowUp":
                if (expandedIndex !== null && options[expandedIndex].subOptions) {
                    setHighlightedIndex((prev) => (prev - 1 + options[expandedIndex].subOptions.length) % options[expandedIndex].subOptions.length);
                } else {
                    setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
                }
                break;

            case "Enter":
            case " ":
                if (expandedIndex === null || options[highlightedIndex].subOptions) {
                    if (expandedIndex === highlightedIndex) {
                        setExpandedIndex(null);
                    } else {
                        setExpandedIndex(highlightedIndex);
                    }
                } else {
                    handleOptionSelect(options[highlightedIndex]);
                }
                break;

            case "Escape":
                setIsOpen(false);
                break;

            default:
                break;
        }
    };

    const filterOptions = (options) => {
        return options.filter((option) => {
            const matchesOptionLabel = option.label.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubOptions = option.subOptions?.some((subOption) =>
                subOption.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesOptionLabel || matchesSubOptions;
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                listboxRef.current &&
                !listboxRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && listboxRef.current) {
            listboxRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="space-y-1 w-full space">
            <label className="block font-medium text-gray-700 text-sm leading-5">
                {label}{" "}{label ? ":" : ""}
            </label>
            <div className={`relative border-2 border-gray-300 hover:border-orange-400 rounded transition duration-300 ease-in-out ${className}`}>
                <button
                    ref={buttonRef}
                    onClick={toggleDropdown}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className="relative py-2 pr-10 pl-3 border w-full sm:text-sm text-left sm:leading-5"
                >
                    <span className="block truncate">
                        {multiple
                            ? (Array.isArray(value) ? value.map((val) => val.label || val).join(", ") : "Sélectionnez...")
                            : value?.label || value || "Sélectionnez..."}
                    </span>
                    <span className="right-0 absolute inset-y-0 flex items-center pr-2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                                fillRule="evenodd"
                            />
                        </svg>
                    </span>
                </button>

                {isOpen && (
                    <ul
                        ref={listboxRef}
                        tabIndex="-1"
                        role="listbox"
                        aria-labelledby={label}
                        className="z-10 absolute bg-white shadow-lg shadow-md mt-2 py-1 border-2 hover:border-orange-400 rounded-md focus:outline-none w-full max-h-64 overflow-auto sm:text-sm text-base leading-6 sm:leading-5 transition duration-300 ease-in-out"
                        onKeyDown={handleKeyDown}
                    >
                        {isNested && (
                            <li className="-top-1 z-10 sticky bg-gray-200 -mt-1 px-4 py-2 border-gray-300 border-b-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value) }}
                                    placeholder="Rechercher..."
                                    className="px-2 py-1 border rounded-md w-full text-sm"
                                />
                            </li>
                        )}

                        {multiple ? options.map((option, index) => (
                            <li
                                key={index}
                                id={`option-${option.Nom}`}
                                role="option"
                                onClick={() => handleOptionSelect(option.Nom)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                onMouseLeave={() => setHighlightedIndex(-1)}
                                className={`cursor-default select-none cursor-pointer relative py-2 pl-4 pr-9 ${highlightedIndex === index
                                    ? "text-white bg-orange-600"
                                    : "text-gray-900"
                                    }`}
                            >
                                <span
                                    className={`block truncate ${value.includes(option.Nom) ? "font-semibold" : "font-normal"
                                        }`}
                                >
                                    {option.Nom}
                                </span>
                                {value.includes(option.Nom) && (
                                    <span
                                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? "text-white" : "text-orange-600"
                                            }`}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                )}
                            </li>
                        ))
                            : isNested
                                ? filterOptions(options).map((option, index) => (
                                    <li key={option.id} className="relative">
                                        <div
                                            role="option"
                                            onClick={() => handleOptionSelect(option)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            onMouseLeave={() => setHighlightedIndex(-1)}
                                            className={`cursor-pointer relative py-3 pl-4 pr-8 ${value === option.label ? "bg-orange-600 text-white" : "text-gray-800"} ${highlightedIndex === index ? "bg-orange-100 text-orange-600" : ""} flex justify-between items-center transition-all duration-200`}
                                        >
                                            <span className="block truncate">{option.label}</span>

                                            {option.subOptions && (

                                                <span className="pr-2 text-gray-500">
                                                    {option.subOptions.filter((subOption) => subOption.selected).length > 0 && (
                                                        <span className="bg-orange-600 mr-2 px-1.5 rounded-xl text-white text-xs text-center text-center">
                                                            {option.subOptions.filter((subOption) => subOption.selected).length}
                                                        </span>
                                                    )}

                                                    {expandedIndex === option.id ? (
                                                        <i className="fa-caret-down fa"></i>
                                                    ) : (
                                                        <i className="fa-caret-right fa"></i>
                                                    )}
                                                </span>
                                            )}

                                        </div>

                                        {expandedIndex === option.id && option.subOptions && (
                                            <ul className="bg-gray-50 ml-6 border-gray-300 border-l-2">
                                                {option.subOptions.map((subOption) => (
                                                    <li
                                                        key={subOption.id}
                                                        role="option"
                                                        onClick={() => onChange(subOption.id)}
                                                        className={`cursor-pointer py-2 pl-8 pr-9 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition duration-200 ${value === subOption.label ? "text-orange-600 font-semibold" : ""
                                                            }`}
                                                    >
                                                        {subOption.label}
                                                        {subOption.selected && (
                                                            <span
                                                                className={`absolute right-0 pr-8 text-orange-600`}
                                                            >
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))

                                : options.map((option, index) => (
                                    <li
                                        key={option}
                                        id={`option-${option}`}
                                        role="option"
                                        onClick={() => handleOptionSelect(option)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        onMouseLeave={() => setHighlightedIndex(-1)}
                                        className={`cursor-default select-none cursor-pointer relative py-2 pl-4 pr-9 ${highlightedIndex === index
                                            ? "text-white bg-orange-600"
                                            : "text-gray-900"
                                            }`}
                                    >
                                        <span
                                            className={`block truncate ${value === option ? "font-semibold" : "font-normal"
                                                }`}
                                        >
                                            {option}
                                        </span>
                                        {value === option && (
                                            <span
                                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? "text-white" : "text-orange-600"
                                                    }`}
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </li>
                                ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;