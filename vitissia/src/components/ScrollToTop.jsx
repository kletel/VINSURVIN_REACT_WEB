// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // ⚠️ Ne pas forcer le scroll en haut sur /cave
        if (pathname === '/cave') return;

        // Gestion des ancres / hash
        if (hash) {
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ block: 'start' });
                return;
            }
        }

        // Comportement par défaut : on remonte en haut
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
        const scrollEl = document.getElementById('main-scroll');
        if (scrollEl) scrollEl.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}
