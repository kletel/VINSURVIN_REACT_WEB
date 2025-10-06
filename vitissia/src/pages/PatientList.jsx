import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import useFetchPatients from '../hooks/useFetchPatients';
import { sanitizeText } from '../utils/SanitizeText';

import ListPatient from '../components/ListPatient';

const PatientList = () => {
    const { patients, fetchPatients, loading, error } = useFetchPatients();

    useEffect(() => {
        fetchPatients();
    }, []);

    if (loading) {
        return <div></div>
    }

    if (error) {
        return <div>Erreur : {error}</div>;
    }

    const patientsSain = patients
        .map(patient => ({
            ...patient,
            // Libelle: sanitizeText(patient.Libelle)
        }));

    return (
        <div class="flex-1 p-6 lg:p-10">
            <div class="gap-6 grid grid-cols-12">
                <div class="gap-6 grid grid-cols-12 col-span-12 xxl:col-span-9">
                    <div class="col-span-12">
                        <div class="flex items-center bg-gray-900 drop-shadow-xl mb-6 px-8 rounded-lg w-full min-h-20">
                            <div id="url" class="flex gap-x-2 font-semibold text-gray-400 text-sm sm:text-lg">
                                <Link to="/patients" class="hover:text-white decoration-teal-600 hover:underline hover:underline-offset-2 transition hover:translate-y-[-2px] duration-300">Patients</Link>
                                <span class="cursor-default">/</span>
                            </div>
                        </div>
                        <ListPatient lstPatients={patientsSain} loading={loading}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
