import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

const Card = ({ id, img, title, description, mounted, setShowPopup }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`aspect-[4/5] sm:aspect-square cursor-pointer relative overflow-hidden rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all duration-700 ease-out group ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            onClick={() => {
                const isLoggedIn = !!sessionStorage.getItem("token");
                if (isLoggedIn) {
                    navigate(`/sommelier/${id}`);
                } else {
                    setShowPopup(true);
                }
            }}
        >
            <img
                src={img}
                alt={title}
				className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 z-0" />
            <div className="absolute inset-0 z-10 m-3 sm:m-5 rounded-xl bg-white/60 backdrop-blur-sm p-3 sm:p-5 ring-1 ring-emerald-900/10 flex items-center justify-center">
                <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-lg md:text-2xl font-semibold tracking-tight text-emerald-900">
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-lg text-emerald-900/80 line-clamp-4">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};





const Sommelier = () => {

    //Animation d'entrée
    const [mounted, setMounted] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

    const cards = [
         {
            id: 'plat',
            img: '/bg-menu.jpg',
            title: 'Choisir une boisson, un vin pour un menu ou un plat',
            description: 'Indiquez votre menu ou votre plat, notre IA sélectionne le ou les boissons dans votre cave ou sur le marché',
        }, {
            id: 'cave',
            img: '/cave-card.png',
            title: 'Analyser et équilibrer ma cave',
            description: 'Notre IA analyse votre cave et vous donne des conseils pour mieux la diversifier.',
        },{
            id: 'rayon',
            img: '/bg-grande_surface.jpg',
            title: 'Choisir un vin dans un rayon',
            description: 'Photographiez un rayon chez un caviste ou en grande surface et obtenez une analyse instantanée.',
        },{
            id: 'restaurant',
            img: '/met-card.png',
            title: 'Choisir un vin au restaurant',
            description: 'Indiquez votre menu et photographiez la carte des vins, notre IA sélectionne les vins pour vous.',
        },
        
       
    ];

    return (
        <div className='mt-4'>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-lg border-b border-gray-200 dark:border-gray-700 px-4 py-6 flex justify-center items-center">
                <div className='flex-col items-center text-center'>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Gabirel, Mon Sommelier-Conseil</h1>
                    <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">Gabriel vous donne des conseils</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 my-16">
                {cards.map((card, index) => (
                    <Card
                        key={card.id}
                        id={card.id}
                        img={card.img}
                        title={card.title}
                        description={card.description}
                        mounted={mounted}
                        setShowPopup={setShowPopup}
                    />))}
            </div>
            {showPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowPopup(false)} />
                    <div className="relative mx-4 w-full max-w-md rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 shadow-2xl">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <i className="pi pi-info-circle" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mon œnologue</h3>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">  Vous restez sur le tableau de bord. Veuillez vous connecter pour y accéder.</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setShowPopup(false)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};


export default Sommelier;