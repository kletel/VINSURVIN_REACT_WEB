import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import LstCave from '../components/Lst_Cave';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchPays from '../hooks/useFetchPays';

const Cave = () => {
  const { caves, error, loading, fetchCaves } = useFetchCaves();
  const { lesPays, fetchLesPays } = useFetchPays();

  useEffect(() => { fetchCaves(); }, [fetchCaves]);
  useEffect(() => { fetchLesPays(); }, [fetchLesPays]);

  return (
    <Layout>
      <div className="pageSidebar">
        <LstCave listeCaves={caves} refreshCaves={fetchCaves} loading={loading} error={error} />
      </div>
    </Layout>
  );
};

export default Cave;
