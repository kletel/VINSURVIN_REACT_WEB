import React, {
    useEffect,
    useLayoutEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import Layout from '../components/Layout';
import LstCave from '../components/Lst_Cave';
import useFetchCaves from '../hooks/useFetchCaves';
import useFetchPays from '../hooks/useFetchPays';
const CAVES_CACHE_KEY = 'vitissia_caves_cache';

const SCROLL_KEY = 'caveScrollY';

const Cave = () => {
    const { caves, error, loading, fetchCaves } = useFetchCaves();
    const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
    const [cachedCaves, setCachedCaves] = useState(null);
    const savedScrollRef = useRef(null);

    useEffect(() => {
        if (!cachedCaves) {
            fetchCaves();
        }
    }, [fetchCaves, cachedCaves]);

    useEffect(() => {
        fetchCaves();
    }, [fetchCaves]);

    useEffect(() => {
        if (!cachedCaves && Array.isArray(caves) && caves.length > 0) {
            try {
                localStorage.setItem(CAVES_CACHE_KEY, JSON.stringify(caves));
            } catch (e) {
                console.warn('Erreur écriture cache caves', e);
            }
        }
    }, [caves, cachedCaves]);

    useEffect(() => {
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (saved != null) {
            const y = parseInt(saved, 10);
            savedScrollRef.current = Number.isNaN(y) ? null : y;
        } else {
            savedScrollRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY || 0;
            sessionStorage.setItem(SCROLL_KEY, String(y));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useLayoutEffect(() => {
        if (hasRestoredScroll) return;
        if (!caves || caves.length === 0) return;

        const y = savedScrollRef.current;
        if (y == null || y <= 0) {
            setHasRestoredScroll(true);
            return;
        }

        requestAnimationFrame(() => {
            window.scrollTo({
                top: y,
                left: 0,
                behavior: 'smooth',
            });
            setHasRestoredScroll(true);
        });
    }, [caves, hasRestoredScroll]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CAVES_CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCachedCaves(parsed);
                }
            }
        } catch (e) {
            console.warn('Erreur lecture cache caves', e);
        }
    }, []);

    return (
        <Layout>
            <div className="pageSidebar">
                <LstCave
                    listeCaves={cachedCaves ?? caves}
                    refreshCaves={fetchCaves}
                    loading={loading}
                    error={error}
                />
            </div>
        </Layout>
    );
};

export default Cave;