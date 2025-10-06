import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import useFetchProducteurs from '../hooks/useFetchProducteurs';
import ListeProducteurs from '../components/ListeProducteurs';

const ProducteursList = () => {
    const { producteurs, fetchProducteurs, loading, error } = useFetchProducteurs();

    useEffect(() => {
        fetchProducteurs();
    }, []);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur : {error}</div>;
    }

    return (
        <div className="flex-1 p-6 lg:p-10">
            <div className="gap-6 grid grid-cols-12">
                <div className="gap-6 grid grid-cols-12 col-span-12 xxl:col-span-9">
                    <div className="col-span-12">
                        <div className="flex items-center bg-gray-900 drop-shadow-xl mb-6 px-8 rounded-lg w-full min-h-20">
                            <div id="url" className="flex gap-x-2 font-semibold text-gray-400 text-sm sm:text-lg">
                                <Link to="/producteurs" className="hover:text-white decoration-teal-600 hover:underline hover:underline-offset-2 transition hover:translate-y-[-2px] duration-300">Producteurs</Link>
                                <span className="cursor-default">/</span>
                            </div>
                        </div>
                        <ListeProducteurs lstProducteurs={producteurs} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProducteursList;
