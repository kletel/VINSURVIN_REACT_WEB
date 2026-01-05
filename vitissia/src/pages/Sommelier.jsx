import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionRequiredModal from '../components/SubscriptionRequiredModal';

const Card = ({ id, img, title, description, mounted, setShowSubscriptionPopup, isPremium }) => {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const imgRef = React.useRef(null);

    // Debug : suivre l'état loaded
    useEffect(() => {
        console.log(`[Card:${id}] render - loaded =`, loaded);
    }, [loaded, id]);

    // Gère le cas où l'image est déjà en cache
    useEffect(() => {
        const imgEl = imgRef.current;
        console.log(`[Card:${id}] useEffect cache check`, imgEl);

        if (!imgEl) return;

        if (imgEl.complete && imgEl.naturalWidth !== 0) {
            console.log(`[Card:${id}] image déjà en cache, on déclenche le loaded avec petite latence`);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setLoaded(true));
            });
        }
    }, [id]);

    return (
        <div
            className={`
                cursor-pointer relative overflow-hidden
                rounded-2xl border border-white/10 shadow-md hover:shadow-xl
                transition-all duration-700 ease-out group
                h-56 sm:h-64 lg:h-[23rem] max-h-[23rem]
                bg-black
                ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `}
            onClick={() => {
                // Vérifier uniquement l'abonnement premium
                if (!isPremium) {
                    setShowSubscriptionPopup(true);
                    return;
                }
                navigate(`/sommelier/${id}`);
            }}
        >
            {/* 🟣 IMAGE */}
            <img
                ref={imgRef}
                src={img}
                alt={title}
                loading="lazy"
                decoding="async"
                onLoad={() => {
                    console.log(`[Card:${id}] onLoad déclenché pour ${img}`);
                    // Petite latence pour voir l’anim
                    setTimeout(() => {
                        console.log(`[Card:${id}] onLoad -> setLoaded(true)`);
                        setLoaded(true);
                    }, 80);
                }}
                className={`
                    absolute inset-0 z-10 h-full w-full object-cover
                    transition-[opacity,transform,filter] duration-700 ease-out
                    group-hover:scale-105
                    ${loaded
                        ? "opacity-100 scale-100 blur-0"
                        : "opacity-0 scale-105 blur-xl"
                    }
                `}
            />

            {/* 🌓 Dégradé sombre au-dessus de l’image (visible uniquement quand loaded=true) */}
            <div
                className={`
                    absolute inset-0 z-20
                    bg-gradient-to-t from-black/80 via-black/55 to-black/25
                    transition-opacity duration-500 ease-out
                    ${loaded ? "opacity-100" : "opacity-0"}
                `}
            />

            {/* ✨ OVERLAY LUXUEUX DE CHARGEMENT (TEXTE + LOADER) */}
            {!loaded && (
                <>
                    {console.log(`[Card:${id}] Loader affiché (loaded = ${loaded})`)}
                    <div
                        className="
                            absolute inset-0 z-40
                            flex flex-col items-center justify-center
                            bg-gradient-to-br from-[#2b0b13]/95 via-[#4f1022]/95 to-[#7b1d33]/95
                            backdrop-blur-sm
                            border border-white/10
                            shadow-[0_0_40px_rgba(0,0,0,0.9)]
                        "
                    >
                        {/* Cercle qui tourne */}
                        <div className="h-12 w-12 rounded-full border-4 border-rose-200/40 border-t-rose-400 animate-spin shadow-[0_0_20px_rgba(251,113,133,0.7)]" />
                        {/* Texte principal */}
                        <p className="mt-4 text-sm sm:text-base text-rose-50 font-medium tracking-wide">
                            Image en cours de chargement...
                        </p>
                        {/* Sous-texte stylé */}
                        <p className="mt-1 text-[11px] sm:text-xs text-rose-100/70 italic">
                            Gabriel prépare votre expérience visuelle 🍷
                        </p>
                    </div>
                </>
            )}

            {/* 📝 Contenu texte au-dessus de l’image (et du loader) */}
            <div className="relative z-50 flex h-full flex-col items-center justify-center px-3 sm:px-5">
                <div className="space-y-1 sm:space-y-2 text-center max-w-[340px] mx-auto">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                        {title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-100/90 line-clamp-4">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Sommelier = () => {
    const [mounted, setMounted] = useState(false);
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

    // Hook pour vérifier l'état d'abonnement
    const { isPremium } = useSubscription();

    const cards = [
        {
            id: 'plat',
            img: '/bg-menu.webp',
            title: 'Choisir une boisson, un vin pour un menu ou un plat',
            description: 'Indiquez votre menu ou votre plat, notre IA sélectionne le ou les boissons dans votre cave ou sur le marché',
        },
        {
            id: 'restaurant',
            img: '/met-card.webp',
            title: 'Choisir un vin au restaurant',
            description: 'Indiquez votre menu et photographiez la carte des vins, notre IA sélectionne les vins pour vous.',
        },
        {
            id: 'rayon',
            img: '/bg-grande_surface.webp',
            title: 'Choisir un vin dans un rayon',
            description: 'Photographiez un rayon chez un caviste ou en grande surface et obtenez une analyse instantanée.',
        },
        {
            id: 'cave',
            img: '/cave-card.webp',
            title: 'Analyser et équilibrer ma cave',
            description: 'Notre IA analyse votre cave et vous donne des conseils pour mieux la diversifier.',
        },
    ];

    // ⚠️ Important : sans ça, mounted reste false → les cards restent invisibles
    useEffect(() => {
        console.log('[Sommelier] useEffect -> setMounted(true)');
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-gradient-to-b from-[#8C2438] via-[#5A1020] to-[#3B0B15]">
            <div className="font-['Work_Sans',sans-serif] max-w-6xl mx-auto px-4 pb-10 pt-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                        Gabriel vous conseille dans le choix des vins et la gestion de votre cave
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 my-10">
                    {cards.map((card) => (
                        <Card
                            key={card.id}
                            id={card.id}
                            img={card.img}
                            title={card.title}
                            description={card.description}
                            mounted={mounted}
                            setShowSubscriptionPopup={setShowSubscriptionPopup}
                            isPremium={isPremium}
                        />
                    ))}
                </div>

                {/* Popup abonnement requis */}
                <SubscriptionRequiredModal
                    isOpen={showSubscriptionPopup}
                    onClose={() => setShowSubscriptionPopup(false)}
                    feature="le sommelier IA Gabriel"
                />
            </div>
        </div>
    );
};

export default Sommelier;