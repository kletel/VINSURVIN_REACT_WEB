import React, {
    useEffect,
    useLayoutEffect,
    useState,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LstCave from '../components/Lst_Cave';
import useFetchCaves from '../hooks/useFetchCaves';
import { GiGrapes } from 'react-icons/gi';
import { motion } from 'framer-motion';

const getCavesCacheKey = (uuid) => (uuid ? `vitissia_caves_cache_${uuid}` : null);
const getCaveScrollKey = (uuid) => (uuid ? `caveScrollY_${uuid}` : 'caveScrollY');

const CaveLoadingScreen = () => {
    const fakeRows = Array.from({ length: 6 });

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-black/30 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-6 md:p-8 overflow-hidden font-['Work_Sans',sans-serif]"
            >

                <div className="pointer-events-none absolute -top-24 -left-10 w-40 h-40 rounded-full bg-[#ff4b6a]/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-10 w-48 h-48 rounded-full bg-[#b20e2a]/25 blur-3xl" />
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-20"
                    initial={{ backgroundPosition: '0% 0%' }}
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                    transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
                        backgroundSize: '16px 16px',
                    }}
                />

                <div className="relative flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ rotate: -8, scale: 0.9 }}
                            animate={{ rotate: 8, scale: 1 }}
                            transition={{
                                repeat: Infinity,
                                repeatType: 'reverse',
                                duration: 1.4,
                                ease: 'easeInOut',
                            }}
                            className="
                                w-16 h-16 md:w-20 md:h-20
                                rounded-3xl
                                bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                                shadow-xl shadow-black/70
                                flex items-center justify-center
                            "
                        >
                            <GiGrapes className="text-2xl md:text-3xl text-red-50 drop-shadow-lg" />
                        </motion.div>

                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-red-100/70 mb-1">
                                Vitiss.IA • Cave en cours de préparation
                            </p>
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                                Chargement de vos vins
                            </h1>
                            <p className="mt-1 text-xs md:text-sm text-red-100/80 max-w-md">
                                Nous préparons votre cave: inventaire, stocks et favoris
                                arrivent dans un instant.
                            </p>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: 'easeInOut',
                                }}
                                className="h-full w-1/2 bg-gradient-to-r from-[#ffe3ea] via-white to-[#ff8ba1] opacity-80"
                            />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-red-100/75">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-pulse" />
                                Récupération de vos caves
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-pulse delay-150" />
                                Calcul des stocks & valeurs
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-pulse delay-300" />
                                Préparation des filtres & favoris
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {fakeRows.map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index, duration: 0.25 }}
                                className="
                                    rounded-2xl border border-white/10 bg-white/5
                                    shadow-[0_14px_40px_rgba(0,0,0,0.65)]
                                    p-3 md:p-4
                                    overflow-hidden
                                "
                            >
                                <div className="flex items-start gap-3">
                                    <AnimatedBottle />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 rounded-full bg-white/15 animate-pulse w-3/4" />
                                        <div className="h-2.5 rounded-full bg-white/10 animate-pulse w-1/2" />
                                        <div className="flex gap-2 mt-1">
                                            <div className="h-2.5 rounded-full bg-white/10 animate-pulse w-16" />
                                            <div className="h-2.5 rounded-full bg-white/10 animate-pulse w-10" />
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <div className="h-2.5 rounded-full bg-white/10 animate-pulse w-20" />
                                            <div className="h-2.5 rounded-full bg-white/10 animate-pulse w-10" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-red-100/70">
                        <span>Astuce : tu peux filtrer par cave, pays, couleur ou favoris.</span>
                        <span className="hidden sm:inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Synchronisation avec ta cave Vitissia
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const AnimatedBottle = () => {
    return (
        <motion.div
            className="relative flex flex-col items-center justify-start"
            initial={{ y: 0, rotate: -1 }}
            animate={{ y: [-2, 2, -2], rotate: [-2, 2, -2] }}
            transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
            }}
        >
            <div className="w-3 h-4 rounded-t-full bg-black/80 shadow-sm shadow-black/60" />

            <div className="w-4 h-3 -mt-1 rounded-b-lg bg-gradient-to-b from-[#f97373] via-[#d41132] to-[#7f0b21] shadow-md shadow-black/70" />

            <div className="relative w-9 h-20 mt-1 rounded-b-[999px] rounded-t-[999px] bg-gradient-to-b from-[#2c0b12] via-[#410f1b] to-[#130509] shadow-lg shadow-black/80 overflow-hidden border border-white/10">

                <motion.div
                    className="absolute inset-x-1 bottom-1 rounded-b-[999px] bg-gradient-to-t from-[#8C2438] via-[#c22a46] to-[#ffb4c6]"
                    style={{ transformOrigin: 'bottom' }}
                    initial={{ scaleY: 0.15 }}
                    animate={{ scaleY: [0.15, 0.9, 0.15] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.8,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute top-1 bottom-3 left-[18%] w-1 bg-gradient-to-b from-white/40 via-white/5 to-transparent opacity-70"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.4,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/10 opacity-50"
                    initial={{ scaleX: 0.8 }}
                    animate={{ scaleX: [0.8, 1.1, 0.8] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: 'easeInOut',
                    }}
                />
            </div>
        </motion.div>
    );
};

const EmptyCaveState = ({ onAddBottle }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-black/35 backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.95)] p-7 md:p-10 overflow-hidden text-center font-['Work_Sans',sans-serif]"
            >
                <div className="pointer-events-none absolute -top-24 -left-12 w-44 h-44 rounded-full bg-[#ff4b6a]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-12 w-52 h-52 rounded-full bg-[#b20e2a]/20 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.92, rotate: -6 }}
                        animate={{ scale: [0.96, 1.04, 0.96], rotate: [-6, 4, -6] }}
                        transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21] shadow-[0_20px_40px_rgba(0,0,0,0.85)] border border-white/20 flex items-center justify-center"
                    >
                        <GiGrapes className="text-3xl md:text-4xl text-red-50 drop-shadow-lg" />
                    </motion.div>

                    <h2 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                        Vous n&apos;avez pas encore de vin dans votre cave
                    </h2>
                    <p className="mt-3 text-sm md:text-base text-red-100/80 max-w-xl leading-relaxed">
                        Vous pouvez la remplir dès maintenant : ajoutez votre première bouteille,
                        puis suivez facilement vos stocks, vos favoris et vos accords.
                    </p>

                    <motion.button
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAddBottle}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm md:text-base font-semibold bg-gradient-to-r from-[#f97373] via-[#d41132] to-[#7f0b21] text-white shadow-[0_20px_45px_rgba(0,0,0,0.9)] hover:shadow-[0_24px_60px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-red-300/70 transition-all duration-300"
                    >
                        <i className="pi pi-plus text-sm" />
                        <span>Ajouter une bouteille</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

const Cave = () => {
    const navigate = useNavigate();
    const uuidUser = sessionStorage.getItem('uuid_user');
    const CAVES_CACHE_KEY = getCavesCacheKey(uuidUser);
    const SCROLL_KEY = getCaveScrollKey(uuidUser);
    const { caves, error, loading, fetchCaves } = useFetchCaves();

    const [cachedCaves, setCachedCaves] = useState(() => {
        if (!CAVES_CACHE_KEY) return null;
        try {
            const raw = localStorage.getItem(CAVES_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
        } catch {
            return null;
        }
    });

    const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
    const savedScrollRef = useRef(null);

    useEffect(() => {
        fetchCaves();
    }, [fetchCaves]);

    useEffect(() => {
        if (Array.isArray(caves) && caves.length > 0) {
            try {
                if (CAVES_CACHE_KEY) {
                    localStorage.setItem(CAVES_CACHE_KEY, JSON.stringify(caves));
                    setCachedCaves(caves);
                }
            } catch (e) {
                console.warn('Erreur écriture cache caves', e);
            }
        }
    }, [caves]);

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

        const source = Array.isArray(caves) && caves.length > 0
            ? caves
            : (cachedCaves ?? []);

        if (!source || source.length === 0) return;

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
    }, [caves, cachedCaves, hasRestoredScroll]);

    const noDataYet =
        (!caves || caves.length === 0) &&
        (!cachedCaves || cachedCaves.length === 0);


    if (loading && noDataYet) {
        return (
            <Layout>
                <CaveLoadingScreen />
            </Layout>
        );
    }

    const listePourAffichage =
        Array.isArray(caves) && caves.length > 0
            ? caves
            : (cachedCaves ?? []);
    const hasAnyWine = Array.isArray(listePourAffichage) && listePourAffichage.length > 0;

    if (!loading && !hasAnyWine) {
        return (
            <Layout>
                <EmptyCaveState onAddBottle={() => navigate('/creation-vin')} />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="pageSidebar">
                <LstCave
                    listeCaves={listePourAffichage}
                    refreshCaves={fetchCaves}
                    loading={loading}
                    error={error}
                />
            </div>
        </Layout>
    );
};

export default Cave;
