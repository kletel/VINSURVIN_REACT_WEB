import React, { useEffect } from "react";
import LstCave from "../components/Lst_Cave";
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchPays from '../hooks/useFetchPays';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { caves, error, loading, fetchCaves } = useFetchCaves();
  const { lesPays, fetchLesPays } = useFetchPays();

  useEffect(() => {
    fetchCaves();
  }, [fetchCaves]);
  useEffect(() => {
    fetchLesPays();
  }, []);

  if (!sessionStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre cave...</p>
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
    <div className="pageSidebar">
      <LstCave listeCaves={caves} refreshCaves={fetchCaves} loading={loading} error={error} />
    </div>
  );
}

export default Dashboard;