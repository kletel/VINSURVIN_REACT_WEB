import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

import useFetchMillesimes from '../hooks/useFetchMillesimes';
import ListeMillesimes from '../components/ListeMillesimes';

const MillesimesList = () => {
    const { darkMode } = useContext(ThemeContext);
    const { millesimes, fetchMillesimes, loading, error } = useFetchMillesimes();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        fetchMillesimes();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement des millésimes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <i className="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h3>
                    <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-4">
                <div className="space-y-6">
                    <ListeMillesimes
                        lstMillesimes={millesimes}
                        loading={loading}
                        isMobile={isMobile}
                        darkMode={darkMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default MillesimesList;
