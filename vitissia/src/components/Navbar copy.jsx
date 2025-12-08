import React, { useState, useRef, useMemo, useEffect } from "react";
import Card from "../components/CardProfile";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { IconContext } from "react-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { GiGrapes } from "react-icons/gi";
import LoginRequiredModal from './LoginRequiredModal';

const Navbar = () => {
    const [sidebar, setSidebar] = useState(false);
    const op = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!sessionStorage.getItem('token');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [nomUser, setNomUser] = useState(() => sessionStorage.getItem('nom_user') || '');


    const initials = useMemo(
        () => nomUser.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join(''),
        [nomUser]
    );

    const showSidebar = () => setSidebar(prev => !prev);
    const closeSidebar = () => setSidebar(false);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') closeSidebar(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const handler = () => {
            const n = sessionStorage.getItem('nom_user') || '';
            setNomUser(n);
        };

        window.addEventListener('app-auth-changed', handler);
        window.addEventListener('storage', handler); 

        return () => {
            window.removeEventListener('app-auth-changed', handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    const isActivePath = (path) =>
        path === '/'
            ? (location.pathname === '/' || location.pathname === '/dashboard')
            : location.pathname === path;

    const protectedPaths = new Set([
        '/cave', '/favoris', '/gerer-cave', '/mes-recettes', '/repartition-pays', '/millesimes'
    ]);

    const SOMMELIER_RESET_KEYS = ["lastSommelierResult"];

    const resetSommelierStorage = () => {
        SOMMELIER_RESET_KEYS.forEach(k => localStorage.removeItem(k));
    };

    const handleNavClick = (e, path) => {
        if (!isLoggedIn && protectedPaths.has(path)) {
            e.preventDefault();
            setShowLoginModal(true);
            return;
        }
        if (path === '/sommelier') {
            resetSommelierStorage();
        }
        closeSidebar();
    };

    const quickLinks = useMemo(() => {
        const flat = SidebarData.flatMap(sec => sec.items);
        const order = ['/cave', '/mets-vins', '/vins-mets', '/dictionnaire', '/mes-recettes', '/sommelier'];
        return order.map(p => flat.find(i => i.path === p)).filter(Boolean);
    }, []);

    return (
        <>
            <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
                {/* NAVBAR PRINCIPALE */}
                <div className="fixed top-0 left-0 right-0 z-50">
                    <div className="relative">
                        <div
                            className="
                                backdrop-blur-xl bg-white/70 dark:bg-gray-900/60
                                border-b border-white/40 dark:border-gray-700
                                shadow-[0_2px_12px_-2px_rgba(0,0,0,0.15)]
                                px-3 md:px-4 lg:px-6
                                py-2 md:py-2
                                flex flex-wrap items-center
                                gap-2 md:gap-3
                            "
                        >
                            {/* Burger + Logo */}
                            <div className="hidden lg:flex items-center gap-2 min-w-[130px]">
                                <button
                                    onClick={showSidebar}
                                    aria-label="Basculer le menu"
                                    aria-expanded={sidebar}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow hover:shadow-md transition-all active:scale-95"
                                >
                                    <FaIcons.FaBars className={`text-base transition-transform ${sidebar ? 'rotate-90' : ''}`} />
                                </button>
                                <Link
                                    to="/"
                                    onClick={closeSidebar}
                                    className="group flex items-center gap-1.5 font-bold text-lg tracking-tight"
                                >
                                    <img src="/vitissia_LOGO.png" alt="Vitissia" className="h-9 w-auto select-none" />
                                </Link>
                            </div>

                            {/* QUICK LINKS – padding & gap réduits à partir de md */}
                            <div className="hidden md:flex flex-1 items-center gap-1 md:gap-1 lg:gap-2">
                                {quickLinks.map(link => {
                                    const active = isActivePath(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={(e) => handleNavClick(e, link.path)}
                                            className={`
          group relative min-w-0
          h-10 sm:h-11 lg:h-12          /* ← même hauteur pour tous */
          rounded-xl text-xs sm:text-sm font-medium
          transition-colors duration-200 ease-out
          ${active
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-gray-700 dark:text-gray-100'
                                                }
        `}
                                        >
                                            {/* Background plein bouton */}
                                            <span
                                                className={`
            absolute inset-0 rounded-xl
            ${active
                                                        ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-400/10 to-teal-500/20 ring-1 ring-emerald-400/40 backdrop-blur-sm'
                                                        : 'bg-white/40 dark:bg-gray-800/40 border border-white/40 dark:border-gray-700/60 group-hover:bg-emerald-50 group-hover:dark:bg-emerald-900/30'
                                                    }
            transition-colors duration-200
          `}
                                            />

                                            {/* Soulignement animé */}
                                            <span
                                                className={`
            pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full origin-left
            bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500
            transition-transform duration-200
            ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
          `}
                                            />

                                            {/* Contenu centré dans la hauteur fixe */}
                                            <span
                                                className="
            relative flex items-center justify-center
            h-full                             /* ← occupe toute la hauteur du bouton */
            gap-1 md:gap-1
            px-2 md:px-2 lg:px-3
          "
                                            >
                                                <span
                                                    className={`
              flex items-center justify-center text-base shrink-0
              transition-transform duration-200
              ${active
                                                            ? 'text-emerald-600 dark:text-emerald-300'
                                                            : 'text-emerald-700/80 dark:text-emerald-200/90 group-hover:text-emerald-400'
                                                        }
              group-hover:scale-110
            `}
                                                >
                                                    {link.icon}
                                                </span>
                                                <span className="whitespace-normal break-words text-center leading-snug">
                                                    {link.title}
                                                </span>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>


                            {/* Zone droite */}
                            <div className="flex items-center gap-2 md:gap-2 ml-auto md:ml-0">
                                {/* Bouton Home mobile */}
                                <button
                                    onClick={() => navigate('/')}
                                    aria-label="Aller au Livre de cave"
                                    className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-emerald-300/60 text-emerald-700 bg-white/70 hover:bg-white transition-colors"
                                >
                                    <i className="pi pi-home" />
                                </button>

                                {/* Nom utilisateur desktop */}
                                {isLoggedIn && (
                                    <div className="hidden lg:flex flex-col items-end leading-tight">
                                        <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Connecté
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[160px] truncate">
                                            {nomUser}
                                        </span>
                                    </div>
                                )}

                                {/* Avatar / Profil */}
                                <Button
                                    className="group relative !w-11 !h-11 md:!w-12 md:!h-12 !p-0 !flex !items-center !justify-center rounded-2xl border-0 shadow-lg shadow-emerald-700/20 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-600 transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                                    type="button"
                                    onClick={(e) => op.current.toggle(e)}
                                    aria-label="Profil utilisateur"
                                >
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40 dark:ring-white/10"></span>
                                    <span className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="absolute -inset-px rounded-3xl [background:conic-gradient(from_180deg_at_50%_50%,#34d39933,transparent_30%,#14b8a633_60%,transparent_80%,#34d39933)] blur-[6px]"></span>
                                    </span>
                                    <span className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-300/20 via-teal-400/10 to-teal-600/20"></span>
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-4px_12px_rgba(0,0,0,0.15)]"></span>
                                    <span className="relative z-10 font-bold text-white text-xs md:text-sm tracking-wide flex items-center justify-center w-full h-full drop-shadow">
                                        {initials || <GiGrapes className='text-base md:text-lg drop-shadow' />}
                                    </span>
                                    {isLoggedIn && (
                                        <span className="pointer-events-none absolute -top-1 -right-1 flex items-center justify-center">
                                            <span className="relative flex">
                                                <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[6px]"></span>
                                                <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 ring-2 ring-white dark:ring-gray-900">
                                                    <span className="absolute inset-0 rounded-full animate-ping bg-emerald-300/70"></span>
                                                    <span className="absolute inset-[3px] rounded-full bg-white/70 mix-blend-overlay"></span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-focus-visible:ring-2 group-focus-visible:ring-emerald-300/40"></span>
                                </Button>

                                <OverlayPanel
                                    ref={op}
                                    className="shadow-2xl border-0 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/90"
                                    style={{ width: '300px' }}
                                >
                                    <Card nomComplet={nomUser} />
                                </OverlayPanel>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spacer pour le contenu */}
                <div className="h-[72px]"></div>

                {/* SIDEBAR */}
                <nav
                    className={`hidden md:block fixed top-0 left-0 h-full z-50 w-72 transition-transform duration-300 ease-in-out transform will-change-transform bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-800/95 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 shadow-2xl border-r border-gray-800 ${sidebar ? 'translate-x-0' : '-translate-x-full'}`}
                    aria-label="Navigation principale"
                    aria-hidden={!sidebar}
                >
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
                        <span className="text-lg font-semibold text-emerald-300 tracking-wide">Menu</span>
                        <button
                            onClick={closeSidebar}
                            aria-label="Fermer le menu"
                            className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                            <AiIcons.AiOutlineClose className="text-xl" />
                        </button>
                    </div>

                    <ul
                        className="nav-menu-items px-4 pb-6 overflow-y-auto h-[calc(100%-64px)] custom-scroll"
                        onClick={(e) => { if (e.target.closest('a')) closeSidebar(); }}
                    >
                        {SidebarData.map((section, index) => (
                            <li key={index} className="mt-6 first:mt-4">
                                <h3 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-2 mb-3">
                                    {section.section}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item, idx) => {
                                        const active = isActivePath(item.path);
                                        return (
                                            <li key={idx}>
                                                <Link
                                                    to={item.path}
                                                    onClick={(e) => handleNavClick(e, item.path)}
                                                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${active ? 'text-emerald-300' : 'text-gray-300 hover:text-white'
                                                        }`}
                                                >
                                                    <span className={`absolute inset-0 rounded-xl ${active
                                                        ? 'bg-white/10 ring-1 ring-emerald-400/30 backdrop-blur-sm'
                                                        : 'group-hover:bg-white/5'
                                                        } transition-colors`}></span>
                                                    <span className="relative flex items-center gap-2">
                                                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg border ${active
                                                            ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-500/30 to-teal-600/30'
                                                            : 'border-white/10 bg-white/5 group-hover:border-emerald-400/30'
                                                            } text-lg text-emerald-300 group-hover:scale-105 transition-transform`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className="relative spanNav truncate max-w-[140px]">
                                                            {item.title}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </nav>
            </IconContext.Provider>

            <LoginRequiredModal
                visible={showLoginModal}
                onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
                onCancel={() => setShowLoginModal(false)}
            />
        </>
    );
};

export default Navbar;


import React, { useState, useRef, useMemo, useEffect } from "react";
import Card from "../components/CardProfile"; 
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { IconContext } from "react-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { GiGrapes } from "react-icons/gi";
import LoginRequiredModal from "./LoginRequiredModal";
import useAuth from "../hooks/useAuth"; 

const Navbar = () => {
    const [sidebar, setSidebar] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false); 
    const op = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth(); 
    const isLoggedIn = !!sessionStorage.getItem("token");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [nomUser, setNomUser] = useState(
        () => sessionStorage.getItem("nom_user") || ""
    );

    const initials = useMemo(
        () =>
            nomUser
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join(""),
        [nomUser]
    );

    const showSidebar = () => setSidebar((prev) => !prev);
    const closeSidebar = () => setSidebar(false);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                closeSidebar();
                setProfileOpen(false);
                if (op.current) op.current.hide();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const handler = () => {
            const n = sessionStorage.getItem("nom_user") || "";
            setNomUser(n);
        };

        window.addEventListener("app-auth-changed", handler);
        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("app-auth-changed", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const isActivePath = (path) =>
        path === "/"
            ? location.pathname === "/" || location.pathname === "/dashboard"
            : location.pathname === path;

    const protectedPaths = new Set([
        "/cave",
        "/favoris",
        "/gerer-cave",
        "/mes-recettes",
        "/repartition-pays",
        "/millesimes",
    ]);

    const SOMMELIER_RESET_KEYS = ["lastSommelierResult"];

    const resetSommelierStorage = () => {
        SOMMELIER_RESET_KEYS.forEach((k) => localStorage.removeItem(k));
    };

    const handleNavClick = (e, path) => {
        if (!isLoggedIn && protectedPaths.has(path)) {
            e.preventDefault();
            setShowLoginModal(true);
            return;
        }
        if (path === "/sommelier") {
            resetSommelierStorage();
        }
        closeSidebar();
    };

    const quickLinks = useMemo(() => {
        const flat = SidebarData.flatMap((sec) => sec.items);
        const order = [
            "/cave",
            "/mets-vins",
            "/vins-mets",
            "/dictionnaire",
            "/mes-recettes",
            "/sommelier",
        ];
        return order.map((p) => flat.find((i) => i.path === p)).filter(Boolean);
    }, []);

    const handleToggleProfile = (e) => {
        setProfileOpen((prev) => !prev);
        if (op.current) {
            op.current.toggle(e);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.warn("Erreur logout:", e);
        } finally {
            setProfileOpen(false);
            if (op.current) op.current.hide();
            navigate("/login");
        }
    };

    return (
        <>
            <IconContext.Provider value={{ style: { verticalAlign: "middle" } }}>
                {/* NAVBAR PRINCIPALE */}
                <div className="fixed top-0 left-0 right-0 z-50 font-['Work_Sans',sans-serif]">
                    <div className="relative">
                        <div
                            className="
                backdrop-blur-xl
                bg-gradient-to-r from-[#221013]/95 via-[#2b1419]/95 to-[#221013]/95
                border-b border-white/10
                shadow-[0_4px_18px_rgba(0,0,0,0.35)]
                px-3 md:px-4 lg:px-6
                py-2 md:py-2
                flex flex-wrap items-center
                gap-2 md:gap-3
                text-white
              "
                        >
                            {/* Burger + Logo */}
                            <div className="hidden lg:flex items-center gap-2 min-w-[130px]">
                                <button
                                    onClick={showSidebar}
                                    aria-label="Basculer le menu"
                                    aria-expanded={sidebar}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#d41132] to-[#79081d] text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    <FaIcons.FaBars
                                        className={`text-base transition-transform ${sidebar ? "rotate-90" : ""
                                            }`}
                                    />
                                </button>
                                <Link
                                    to="/"
                                    onClick={closeSidebar}
                                    className="group flex items-center gap-1.5 font-bold text-lg tracking-tight text-white"
                                >
                                    <img
                                        src="/vitissia_LOGO.png"
                                        alt="Vitissia"
                                        className="h-9 w-auto select-none"
                                    />
                                </Link>
                            </div>

                            {/* QUICK LINKS */}
                            <div className="hidden md:flex flex-1 items-center gap-1 md:gap-1 lg:gap-2">
                                {quickLinks.map((link) => {
                                    const active = isActivePath(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={(e) => handleNavClick(e, link.path)}
                                            className={`
                        group relative min-w-0
                        h-10 sm:h-11 lg:h-12
                        rounded-xl text-xs sm:text-sm font-medium
                        transition-colors duration-250 ease-out
                        ${active ? "text-red-100" : "text-gray-100/90"
                                                }
                      `}
                                        >
                                            {/* Background plein bouton */}
                                            <span
                                                className={`
                          absolute inset-0 rounded-xl
                          ${active
                                                        ? "bg-gradient-to-br from-[#d41132]/80 via-[#b20e2a]/75 to-[#7f0b21]/80 ring-1 ring-[#ff4b6a]/60"
                                                        : "bg-white/5 border border-white/10 group-hover:bg-white/10"
                                                    }
                          transition-colors duration-250
                        `}
                                            />

                                            {/* Soulignement animé */}
                                            <span
                                                className={`
                          pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full origin-left
                          bg-gradient-to-r from-[#ff4b6a] via-[#ff7a8b] to-[#ff4b6a]
                          transition-transform duration-250
                          ${active
                                                        ? "scale-x-100"
                                                        : "scale-x-0 group-hover:scale-x-100"
                                                    }
                        `}
                                            />

                                            {/* Contenu centré */}
                                            <span
                                                className="
                          relative flex items-center justify-center
                          h-full
                          gap-1 md:gap-1
                          px-2 md:px-2 lg:px-3
                        "
                                            >
                                                <span
                                                    className={`
                            flex items-center justify-center text-base shrink-0
                            transition-transform duration-200
                            ${active
                                                            ? "text-white"
                                                            : "text-red-100/90 group-hover:text-white"
                                                        }
                            group-hover:scale-110
                          `}
                                                >
                                                    {link.icon}
                                                </span>
                                                <span className="whitespace-normal break-words text-center leading-snug">
                                                    {link.title}
                                                </span>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Zone droite */}
                            <div className="flex items-center gap-2 md:gap-2 ml-auto md:ml-0">
                                {/* Bouton Home mobile */}
                                <button
                                    onClick={() => navigate("/")}
                                    aria-label="Aller au Livre de cave"
                                    className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/30 text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <i className="pi pi-home" />
                                </button>

                                {/* Nom utilisateur desktop */}
                                {isLoggedIn && (
                                    <div className="hidden lg:flex flex-col items-end leading-tight">
                                        <span className="text-[11px] uppercase tracking-wide text-red-200/80">
                                            Connecté
                                        </span>
                                        <span className="text-sm font-semibold text-white max-w-[160px] truncate">
                                            {nomUser}
                                        </span>
                                    </div>
                                )}

                                {/* Avatar / Profil */}
                                <Button
                                    className="
                    group relative !w-11 !h-11 md:!w-12 md:!h-12 !p-0
                    !flex !items-center !justify-center
                    rounded-2xl border-0
                    shadow-lg shadow-black/40
                    bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                    hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                    transition-all duration-300 ease-out
                    active:scale-[0.97]
                    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff4b6a]/40
                  "
                                    type="button"
                                    onClick={handleToggleProfile}
                                    aria-label="Profil utilisateur"
                                >
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/30"></span>
                                    <span className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="absolute -inset-px rounded-3xl [background:conic-gradient(from_180deg_at_50%_50%,#ff7a8b33,transparent_30%,#ff4b6a33_60%,transparent_80%,#ff7a8b33)] blur-[6px]"></span>
                                    </span>
                                    <span className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-white/5 to-black/20"></span>
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-4px_12px_rgba(0,0,0,0.4)]"></span>
                                    <span className="relative z-10 font-bold text-white text-xs md:text-sm tracking-wide flex items-center justify-center w-full h-full drop-shadow">
                                        {initials || (
                                            <GiGrapes className="text-base md:text-lg drop-shadow" />
                                        )}
                                    </span>
                                    {isLoggedIn && (
                                        <span className="pointer-events-none absolute -top-1 -right-1 flex items-center justify-center">
                                            <span className="relative flex">
                                                <span className="absolute inset-0 rounded-full bg-[#ff4b6a]/40 blur-[6px]"></span>
                                                <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-[#ff7a8b] to-[#ff4b6a] ring-2 ring-[#221013]">
                                                    <span className="absolute inset-0 rounded-full animate-ping bg-[#ff7a8b]/70"></span>
                                                    <span className="absolute inset-[3px] rounded-full bg-white/80 mix-blend-overlay"></span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-focus-visible:ring-2 group-focus-visible:ring-[#ff7a8b]/40"></span>
                                </Button>

                                {/* POPUP PROFIL MODERNISÉE */}
                                <OverlayPanel
                                    ref={op}
                                    className="shadow-2xl border-0 rounded-2xl overflow-hidden backdrop-blur-2xl bg-[#1a090b]/95"
                                    style={{ width: "320px" }}
                                    onHide={() => setProfileOpen(false)}
                                    onShow={() => setProfileOpen(true)}
                                >
                                    <div
                                        className={`
                      relative p-5 text-white
                      transition-all duration-300
                      ${profileOpen
                                                ? "opacity-100 translate-y-0 scale-100"
                                                : "opacity-0 translate-y-2 scale-95"
                                            }
                    `}
                                    >
                                        {/* Glow décoratif */}
                                        <div className="pointer-events-none absolute -top-24 -right-16 w-40 h-40 rounded-full bg-[#ff4b6a]/20 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-24 -left-16 w-40 h-40 rounded-full bg-[#b20e2a]/20 blur-3xl" />

                                        {/* En-tête profil */}
                                        <div className="relative flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d41132] via-[#b20e2a] to-[#7f0b21] shadow-lg shadow-black/40 flex items-center justify-center text-xl font-bold">
                                                    {initials || <GiGrapes />}
                                                </div>
                                                {isLoggedIn && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                                                        <span className="relative flex">
                                                            <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[5px]" />
                                                            <span className="relative w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#1a090b]">
                                                                <span className="absolute inset-0 rounded-full animate-ping bg-emerald-300/70" />
                                                                <span className="absolute inset-[3px] rounded-full bg-white/80 mix-blend-overlay" />
                                                            </span>
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs uppercase tracking-[0.14em] text-red-200/80">
                                                    PROFIL
                                                </p>
                                                <h3 className="mt-1 text-lg font-semibold leading-snug">
                                                    {nomUser || "Invité"}
                                                </h3>
                                                <p className="text-xs text-red-100/80 mt-0.5">
                                                    Vitiss.IA • Votre sommelier numérique
                                                </p>
                                            </div>
                                        </div>

                                        {/* Petite ligne de séparation */}
                                        <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                        {/* Actions rapides */}
                                        <div className="mt-4 space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isLoggedIn) {
                                                        navigate("/profil"); // adapte si tu as une route différente
                                                    } else {
                                                        setShowLoginModal(true);
                                                    }
                                                    if (op.current) op.current.hide();
                                                }}
                                                className="
                          w-full flex items-center justify-between
                          rounded-xl px-3 py-2.5
                          bg-white/5 hover:bg-white/10
                          border border-white/10
                          transition-all duration-200
                        "
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center">
                                                        <FaIcons.FaUser className="text-sm" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium">Mon espace</p>
                                                        <p className="text-[11px] text-red-100/80">
                                                            Gérer mes informations et préférences
                                                        </p>
                                                    </div>
                                                </div>
                                                <i className="pi pi-chevron-right text-xs opacity-80" />
                                            </button>

                                            {/* Déconnexion */}
                                            {isLoggedIn && (
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="
                            w-full inline-flex items-center justify-center gap-2
                            rounded-xl px-4 py-2.5
                            bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21]
                            hover:from-[#ff2852] hover:via-[#d41132] hover:to-[#8a0b23]
                            text-white text-sm font-semibold
                            shadow-md shadow-black/40
                            transition-all duration-200
                            active:scale-[0.97]
                          "
                                                >
                                                    <FaIcons.FaSignOutAlt className="text-sm" />
                                                    Déconnexion
                                                </button>
                                            )}

                                            {!isLoggedIn && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowLoginModal(true);
                                                        if (op.current) op.current.hide();
                                                    }}
                                                    className="
                            w-full inline-flex items-center justify-center gap-2
                            rounded-xl px-4 py-2.5
                            bg-white/10 hover:bg-white/15
                            text-white text-sm font-semibold
                            border border-white/20
                            transition-all duration-200
                          "
                                                >
                                                    <FaIcons.FaSignInAlt className="text-sm" />
                                                    Se connecter
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </OverlayPanel>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spacer pour le contenu */}
                <div className="h-[72px] "></div>

                {/* SIDEBAR */}
                <nav
                    className={`
            hidden md:block fixed top-0 left-0 h-full z-50 w-72
            transition-transform duration-300 ease-in-out transform will-change-transform
            bg-gradient-to-b from-[#14070a]/98 via-[#1b080c]/98 to-[#14070a]/98
            shadow-2xl border-r border-white/10
            ${sidebar ? "translate-x-0" : "-translate-x-full"}
          `}
                    aria-label="Navigation principale"
                    aria-hidden={!sidebar}
                >
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
                        <span className="text-lg font-semibold text-red-200 tracking-wide">
                            Menu
                        </span>
                        <button
                            onClick={closeSidebar}
                            aria-label="Fermer le menu"
                            className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors"
                        >
                            <AiIcons.AiOutlineClose className="text-xl" />
                        </button>
                    </div>

                    <ul
                        className="nav-menu-items px-4 pb-6 overflow-y-auto h-[calc(100%-64px)] custom-scroll"
                        onClick={(e) => {
                            if (e.target.closest("a")) closeSidebar();
                        }}
                    >
                        {SidebarData.map((section, index) => (
                            <li key={index} className="mt-6 first:mt-4">
                                <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-2 mb-3">
                                    {section.section}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item, idx) => {
                                        const active = isActivePath(item.path);
                                        return (
                                            <li key={idx}>
                                                <Link
                                                    to={item.path}
                                                    onClick={(e) => handleNavClick(e, item.path)}
                                                    className={`
                            group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all relative
                            ${active
                                                            ? "text-red-200"
                                                            : "text-gray-200 hover:text-white"
                                                        }
                          `}
                                                >
                                                    <span
                                                        className={`
                              absolute inset-0 rounded-xl
                              ${active
                                                                ? "bg-white/10 ring-1 ring-[#ff4b6a]/40 backdrop-blur-sm"
                                                                : "group-hover:bg-white/5"
                                                            }
                              transition-colors
                            `}
                                                    ></span>
                                                    <span className="relative flex items-center gap-2">
                                                        <span
                                                            className={`
                                flex items-center justify-center w-8 h-8 rounded-lg border
                                ${active
                                                                    ? "border-[#ff7a8b]/60 bg-gradient-to-br from-[#d41132]/40 to-[#7f0b21]/40"
                                                                    : "border-white/10 bg-white/5 group-hover:border-[#ff4b6a]/40"
                                                                }
                                text-lg text-red-200 group-hover:scale-105 transition-transform
                              `}
                                                        >
                                                            {item.icon}
                                                        </span>
                                                        <span className="relative spanNav truncate max-w-[140px]">
                                                            {item.title}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </nav>
            </IconContext.Provider>

            <LoginRequiredModal
                visible={showLoginModal}
                onLogin={() => {
                    setShowLoginModal(false);
                    navigate("/login");
                }}
                onCancel={() => setShowLoginModal(false)}
            />
        </>
    );
};

export default Navbar;