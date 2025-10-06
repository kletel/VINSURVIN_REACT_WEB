import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DonutSeries from '../components/DonutSeries';
import useRepartitionPays from '../hooks/useRepartitionPays';

const RepartitionPays = () => {
    const { repartition, fetchRepartitionPays, loading, error } = useRepartitionPays();

    useEffect(() => {
        fetchRepartitionPays();
    }, [fetchRepartitionPays]);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur : {error}</div>;
    }

    return (
        <div className="flex-1 p-6 lg:p-10">
            <div className="flex items-center bg-gray-900 drop-shadow-xl mb-6 px-8 rounded-lg w-full min-h-20">
                <div id="url" className="flex gap-x-2 font-semibold text-gray-400 text-sm sm:text-lg">
                    <Link to="/repartition-pays" className="hover:text-white decoration-teal-600 hover:underline hover:underline-offset-2 transition duration-200">Répartition par Pays</Link>
                    <span className="cursor-default">/</span>
                </div>
            </div>
            <DonutSeries data={repartition} />
        </div>
    );
};

export default RepartitionPays;
