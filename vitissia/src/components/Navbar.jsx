import React, { useState, useRef, useMemo, useEffect } from "react";
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
import { motion } from "framer-motion";

const MotionLink = motion(Link);

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
                                bg-black
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

                            {/* QUICK LINKS MODERNES / ÉPURÉS */}
                            <div className="hidden md:flex flex-1 items-center gap-1 md:gap-1 lg:gap-2">
                                {quickLinks.map((link, index) => {
                                    const active = isActivePath(link.path);
                                    return (
                                        <MotionLink
                                            key={link.path}
                                            to={link.path}
                                            onClick={(e) => handleNavClick(e, link.path)}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.25,
                                                delay: 0.05 * index,
                                                ease: "easeOut",
                                            }}
                                            whileHover={{
                                                y: -1,
                                                scale: 1.02,
                                                transition: { duration: 0.22, ease: "easeOut" }
                                            }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`
                    group relative inline-flex items-center justify-center
                    min-w-0
                    h-9 sm:h-10 lg:h-10
                    rounded-full px-3 sm:px-3.5 lg:px-4
                    text-xs sm:text-sm font-medium
                    ${active ? "text-white" : "text-gray-100/85"}
                    transition-all duration-200
                `}
                                        >
                                            {/* fond pill actif = rouge plus foncé, comme le bouton user */}
                                            <span
                                                className={`
                        absolute inset-0 rounded-full
                        ${active
                                                        ? "bg-gradient-to-r from-[#d41132] via-[#b20e2a] to-[#7f0b21] shadow-[0_0_18px_rgba(127,11,33,0.55)]"
                                                        : "bg-white/0 group-hover:bg-white/10"
                                                    }
                        transition-all duration-250
                    `}
                                            />

                                            {/* soulignement : même rouge foncé, caché quand actif */}
                                            <span
                                                className={`
                        pointer-events-none absolute -bottom-1 left-4 right-4 h-[2px] rounded-full origin-center
                        bg-gradient-to-r from-[#b20e2a] via-[#7f0b21] to-[#b20e2a]
                        transition-transform duration-300
                        ${active
                                                        ? "scale-x-0"              // toujours invisible quand sélectionné
                                                        : "scale-x-0 group-hover:scale-x-100"
                                                    }
                    `}
                                            />

                                            {/* contenu */}
                                            <span className="relative flex items-center gap-1.5">
                                                <span
                                                    className={`
                            flex items-center justify-center text-base shrink-0
                            transition-transform duration-300
                            ${active
                                                            ? "text-white"
                                                            : "text-red-100/90 group-hover:text-white"
                                                        }
                            group-hover:scale-105
                        `}
                                                >
                                                    {link.icon}
                                                </span>
                                                <span className="whitespace-normal break-words text-center leading-snug">
                                                    {link.title}
                                                </span>
                                            </span>
                                        </MotionLink>
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
                                                        navigate("/profil");
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

                <div className="h-[72px] bg-[#8C2438]"></div>

                {/* SIDEBAR MODERNISÉE */}
                <nav
                    className={`
                        hidden md:block fixed top-0 left-0 h-full z-50 w-72
                        transition-transform duration-300 ease-in-out transform will-change-transform
                        bg-black
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
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.25,
                                                    delay: 0.03 * idx,
                                                }}
                                            >
                                                <MotionLink
                                                    to={item.path}
                                                    whileHover={{ x: 4, scale: 1.01 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={(e) => handleNavClick(e, item.path)}
                                                    className={`
                                                        group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium relative
                                                        ${active
                                                            ? "text-red-200"
                                                            : "text-gray-200 hover:text-white"
                                                        }
                                                        transition-all duration-200
                                                    `}
                                                >
                                                    {/* barre latérale active minimaliste */}
                                                    <span
                                                        className={`
                                                            pointer-events-none absolute left-0 top-1 bottom-1 w-[3px] rounded-full
                                                            bg-gradient-to-b from-[#ff7a8b] to-[#d41132]
                                                            transition-transform duration-300 origin-top
                                                            ${active
                                                                ? "scale-y-100"
                                                                : "scale-y-0 group-hover:scale-y-75"
                                                            }
                                                        `}
                                                    />

                                                    {/* léger fond hover, plus de gros bloc / border */}
                                                    <span
                                                        className={`
                                                            absolute inset-y-0 left-1.5 right-0 rounded-lg
                                                            ${active
                                                                ? "bg-white/10 backdrop-blur-sm"
                                                                : "bg-white/0 group-hover:bg-white/5"
                                                            }
                                                            transition-colors duration-200
                                                        `}
                                                    />

                                                    <span className="relative flex items-center gap-2 pl-1.5">
                                                        <span
                                                            className={`
                                                                flex items-center justify-center w-7 h-7 rounded-lg
                                                                ${active
                                                                    ? "bg-gradient-to-br from-[#d41132]/70 to-[#7f0b21]/70"
                                                                    : "bg-white/5 group-hover:bg-white/10"
                                                                }
                                                                text-lg text-red-200 group-hover:scale-105 transition-transform
                                                            `}
                                                        >
                                                            {item.icon}
                                                        </span>
                                                        <span className="relative spanNav truncate max-w-[160px]">
                                                            {item.title}
                                                        </span>
                                                    </span>
                                                </MotionLink>
                                            </motion.li>
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