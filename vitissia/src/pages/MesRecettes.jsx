import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { motion } from 'framer-motion';

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const MesRecettes = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [recipesMap, setRecipesMap] = useState({});

    const getKey = (rec) =>
        rec?.UUID_Met ||
        rec?.UUID_ ||
        rec?.uuidRecette ||
        rec?.id ||
        `name:${(rec?.nomPlat || rec?.Nom || rec?.Met || '').toLowerCase()}`;

    useEffect(() => {
        const fetchRecettesUtilisateur = async () => {
            try {
                setLoading(true);
                const UUID_User = sessionStorage.getItem('uuid_user');
                if (!UUID_User) throw new Error('Utilisateur non identifié');

                const base = `${config.apiBaseUrl}/4DACTION/react_getRecettesUtilisateur?UUID_user=${encodeURIComponent(
                    UUID_User
                )}`;

                const [respFav, respSave] = await Promise.all([
                    fetch(`${base}&action=favori`, { method: 'GET', headers: authHeader() }),
                    fetch(`${base}&action=enregistrer`, { method: 'GET', headers: authHeader() }),
                ]);

                if (!respFav.ok && !respSave.ok) throw new Error('Impossible de récupérer vos recettes');

                const [dataFav, dataSave] = await Promise.all([
                    respFav.ok ? respFav.json() : Promise.resolve([]),
                    respSave.ok ? respSave.json() : Promise.resolve([]),
                ]);

                const map = new Map();
                const addList = (list, type) => {
                    (Array.isArray(list) ? list : []).forEach((rec) => {
                        const key = getKey(rec);
                        if (!key) return;
                        const existing = map.get(key);
                        if (existing) {
                            if (type === 'favori') existing.isFavori = true;
                            if (type === 'enregistrer') existing.isEnregistrer = true;
                        } else {
                            map.set(key, {
                                ...rec,
                                isFavori: type === 'favori',
                                isEnregistrer: type === 'enregistrer',
                            });
                        }
                    });
                };

                addList(dataFav, 'favori');
                addList(dataSave, 'enregistrer');

                const merged = Array.from(map.values());
                setItems(merged);

                // Récupérations détaillées
                const uuids = Array.from(
                    new Set(
                        merged
                            .map(
                                (r) =>
                                    r?.UUID_Recette ||
                                    r?.UUID_Met ||
                                    r?.UUID_ ||
                                    r?.uuidRecette ||
                                    r?.uuid
                            )
                            .filter(Boolean)
                    )
                );

                if (uuids.length > 0) {
                    const valeurs = encodeURIComponent(uuids.join(','));
                    const url = `${config.apiBaseUrl}/4DACTION/react_getRecettes?champs=UUID_Recette&valeurs=${valeurs}`;
                    const resp = await fetch(url, { method: 'GET', headers: authHeader() });
                    if (resp.ok) {
                        const data = await resp.json();
                        const rMap = {};
                        (Array.isArray(data) ? data : []).forEach((rec) => {
                            const key =
                                rec?.UUID_Recette || rec?.UUID_ || rec?.uuidRecette || rec?.uuid;
                            if (key && !(key in rMap)) rMap[key] = rec;
                        });
                        setRecipesMap(rMap);
                    } else {
                        setRecipesMap({});
                    }
                } else {
                    setRecipesMap({});
                }
            } catch (e) {
                setError(e.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: e.message,
                    life: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRecettesUtilisateur();
    }, []);

    const getUUIDFromItem = (rec) =>
        rec?.UUID_Recette ||
        rec?.UUID_ ||
        rec?.uuidRecette ||
        rec?.uuid ||
        rec?.UUID_Met ||
        null;

    const getNomMetFromItem = (rec) => {
        const id = getUUIDFromItem(rec);
        if (id && recipesMap[id]?.nomMet) return recipesMap[id].nomMet;
        return rec?.nomMet || rec?.nom || rec?.Met || 'Recette';
    };

    const openRecette = (rec) => {
        try {
            const name = getNomMetFromItem(rec) || '';
            const uuid = getUUIDFromItem(rec) || '';
            if (name) sessionStorage.setItem('metName', name);
            if (uuid) sessionStorage.setItem('recetteUUID', uuid);
            sessionStorage.setItem('recetteOrigin', 'MES_RECETTES');
        } catch { }
        navigate('/recette');
    };

    const list = useMemo(() => items, [items]);

    return (
        <Layout>
            <Toast ref={toast} />

            <div className="font-['Work_Sans',sans-serif] min-h-screen bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15] text-white">
                <div
                    className="
                        px-4 py-6 mb-4
                        border-b border-black/40
                        shadow-[0_18px_30px_-18px_rgba(0,0,0,0.9)]
                        bg-transparent
                    "
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                                Mes recettes
                            </h1>
                            <p className="mt-1 text-sm text-white/70">
                                Retrouvez vos recettes favorisées et enregistrées, prêtes à être accordées avec vos vins.
                            </p>
                        </div>
                    </div>
                </div>

                <MotionDiv
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="max-w-6xl mx-auto px-4 py-8"
                >
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-white/80">
                            <div className="relative mb-3">
                                <div className="w-10 h-10 rounded-full border-2 border-rose-400/50 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 rounded-full blur-md bg-rose-500/30 opacity-60" />
                            </div>
                            <span>Chargement de vos recettes…</span>
                        </div>
                    ) : error ? (
                        <div className="py-24 text-center text-rose-200">
                            {error}
                        </div>
                    ) : list.length === 0 ? (
                        <div className="py-24 text-center text-white/75">
                            Aucune recette enregistrée pour le moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {list.map((rec, i) => (
                                <MotionButton
                                    key={rec.UUID_Met || rec.UUID_ || i}
                                    onClick={() => openRecette(rec)}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="
                                        group relative overflow-hidden rounded-2xl text-left
                                        bg-gray-900/80
                                        border border-gray-700
                                        shadow-[0_22px_70px_rgba(0,0,0,1)]
                                        focus:outline-none focus:ring-2 focus:ring-[#fb7185]/60 focus:ring-offset-2 focus:ring-offset-black
                                    "
                                >
                                    <div
                                        className="
                                            pointer-events-none absolute -inset-px
                                            opacity-0 group-hover:opacity-100
                                            bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),_transparent_55%)]
                                            transition-opacity duration-300
                                        "
                                    />

                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        {rec?.imageBase64 ? (
                                            <img
                                                src={`data:image/jpeg;base64,${rec.imageBase64}`}
                                                alt={rec?.nomPlat || rec?.Nom || rec?.Met || 'Recette'}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/30 bg-black/40">
                                                <i className="pi pi-image text-3xl" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                        {rec?.isFavori && (
                                            <div className="absolute top-2 right-2">
                                                <MotionSpan
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                    className="
                                                        inline-flex items-center gap-1 px-2 py-1
                                                        rounded-full text-[10px]
                                                        bg-black/70 border border-rose-400/70
                                                        text-rose-200 shadow-[0_0_18px_rgba(248,113,113,0.7)]
                                                    "
                                                >
                                                    <i className="pi pi-heart-fill text-xs" />
                                                    Favori
                                                </MotionSpan>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 relative z-10">
                                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                                            {getNomMetFromItem(rec)}
                                        </h3>

                                        {rec?.difficulte && (
                                            <p className="mt-1 text-xs sm:text-sm text-white/75">
                                                Difficulté : {rec.difficulte}
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                                            <span className="text-white/50">
                                                Cliquer pour ouvrir la fiche
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {rec?.isEnregistrer && (
                                                    <span
                                                        className="inline-flex items-center gap-1 text-amber-300"
                                                        title="Enregistré"
                                                    >
                                                        <i className="pi pi-bookmark" />
                                                    </span>
                                                )}

                                                {rec?.isFavori && (
                                                    <MotionSpan
                                                        initial={{ scale: 1 }}
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                        }}
                                                        transition={{
                                                            duration: 0.6,
                                                            repeat: Infinity,
                                                            repeatDelay: 2,
                                                            ease: 'easeInOut',
                                                        }}
                                                        className="
                                                            relative inline-flex items-center justify-center
                                                            w-7 h-7 rounded-full
                                                            text-[#fb7185]
                                                            bg-black/60 border border-[#fb7185]/60
                                                            shadow-[0_0_20px_rgba(248,113,113,0.8)]
                                                        "
                                                        title="Favori"
                                                    >
                                                        <span
                                                            className="
                                                                absolute inset-0 rounded-full
                                                                bg-[#fb7185]/40 blur-md
                                                                opacity-80
                                                            "
                                                            aria-hidden="true"
                                                        />
                                                        <i className="pi pi-heart-fill relative z-10 text-sm" />
                                                    </MotionSpan>
                                                )}

                                                {!rec?.isFavori && !rec?.isEnregistrer && (
                                                    <span className="text-white/40 text-[11px]">
                                                        Recette
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <span
                                        className="
                                            pointer-events-none absolute inset-0 rounded-2xl
                                            opacity-0 group-hover:opacity-100
                                            transition-opacity duration-200
                                            ring-1 ring-[#fb7185]/55
                                        "
                                    />
                                </MotionButton>
                            ))}
                        </div>
                    )}
                </MotionDiv>
            </div>
        </Layout>
    );
};

export default MesRecettes;
