import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { GiGrapes, GiWineBottle } from "react-icons/gi";
import LoginRequiredModal from "./LoginRequiredModal";
import useAuth from "../hooks/useAuth";

const BottomBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const isLoggedIn = !!sessionStorage.getItem("token");

    const [showLoginModal, setShowLoginModal] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const op = useRef(null);
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

    const menuItems = [
        {
            path: "/dashboard",
            label: "Accueil",
            iconType: "pi",
            icon: "pi pi-home",
        },
        {
            path: "/cave",
            label: "Cave",
            iconType: "react",
            icon: GiWineBottle,
        },
        {
            path: "/vins-mets",
            label: "Vin",
            iconType: "pi",
            icon: "pi pi-search",
        },
        {
            path: "/mets-vins",
            label: "Met",
            iconType: "pi",
            icon: "pi pi-search",
        },
        {
            path: "/sommelier",
            label: "Sommelier",
            iconType: "pi",
            icon: "pi pi-sparkles",
        },
    ];


    const isActive = (path) => {
        if (path === "/dashboard") {
            return (
                location.pathname === "/" ||
                location.pathname === "/dashboard"
            );
        }

        if (path === "/cave") {
            if (
                location.pathname === "/" ||
                location.pathname === "/dashboard"
            ) {
                return false;
            }
            return location.pathname === "/cave";
        }

        return location.pathname === path;
    };

    // Seules ces routes nécessitent une connexion
    // Note: /dashboard, /vins-mets, /mets-vins, /sommelier sont accessibles sans connexion
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

    const handleClick = (path) => {
        // Vérifier si le chemin exact est protégé (pas de startsWith pour éviter les faux positifs)
        if (!isLoggedIn && protectedPaths.has(path)) {
            setShowLoginModal(true);
            return;
        }
        if (path === "/sommelier") {
            resetSommelierStorage();
        }
        navigate(path);
    };

    const hideRoutes = new Set([
        "/login",
        "/inscription",
        "/forgot-password",
        "/reset-password",
    ]);
    const hideOnThisRoute = hideRoutes.has(location.pathname);

    if (hideOnThisRoute) return null;

    return (
        <>
            <div
                className="
                   fixed bottom-0 left-0 right-0
                   md:hidden
                   z-[9999]
                   backdrop-blur-xl
                   bg-black
                   border-t border-white/10
                   shadow-[0_-4px_18px_rgba(0,0,0,0.6)]
                   safe-area-pb
               "
            >
                <div className="flex justify-between items-center px-4 pt-1.5 pb-3 gap-2">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const IconComponent = item.iconType === "react" ? item.icon : null;

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleClick(item.path)}
                                className={`
                                    flex flex-col items-center justify-center
                                    py-1.5 px-3
                                    rounded-2xl
                                    transition-all duration-200
                                    min-w-0 flex-1 max-w-[96px]
                                    ${active
                                        ? `
                                            text-white
                                            bg-gradient-to-t from-[#7f0b21] via-[#b20e2a] to-[#d41132]
                                            shadow-[0_0_14px_rgba(212,17,50,0.55)]
                                            scale-[1.02]
                                        `
                                        : `
                                            text-gray-300/90
                                            hover:text-white
                                            hover:bg-white/5
                                        `
                                    }
                                `}
                            >
                                {item.iconType === "pi" && item.icon && (
                                    <i
                                        className={`
                                            ${item.icon}
                                            text-[19px]
                                            mb-0.5
                                            ${active ? "opacity-100" : "opacity-90"}
                                        `}
                                    />
                                )}

                                {item.iconType === "react" && IconComponent && (
                                    <IconComponent
                                        className={`
                                            text-[20px]
                                            mb-0.5
                                            ${active ? "text-white" : "text-gray-300/90"}
                                        `}
                                    />
                                )}

                                <span
                                    className={`
                                        text-[11px] font-medium truncate max-w-full leading-tight
                                        ${active ? "font-semibold" : ""}
                                    `}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    <Button
                        className="
                            group relative !w-11 !h-11 !p-0
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
                        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/30" />
                        <span className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="absolute -inset-px rounded-3xl [background:conic-gradient(from_180deg_at_50%_50%,#ff7a8b33,transparent_30%,#ff4b6a33_60%,transparent_80%,#ff7a8b33)] blur-[6px]" />
                        </span>
                        <span className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-white/5 to-black/20" />
                        <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-4px_12px_rgba(0,0,0,0.4)]" />
                        <span className="relative z-10 font-bold text-white text-xs tracking-wide flex items-center justify-center w-full h-full drop-shadow">
                            {initials || <GiGrapes className="text-base drop-shadow" />}
                        </span>

                        {isLoggedIn && (
                            <span className="pointer-events-none absolute -top-1 -right-1 flex items-center justify-center">
                                <span className="relative flex">
                                    <span className="absolute inset-0 rounded-full bg-[#ff4b6a]/40 blur-[6px]" />
                                    <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-[#ff7a8b] to-[#ff4b6a] ring-2 ring-[#221013]">
                                        <span className="absolute inset-0 rounded-full animate-ping bg-[#ff7a8b]/70" />
                                        <span className="absolute inset-[3px] rounded-full bg-white/80 mix-blend-overlay" />
                                    </span>
                                </span>
                            </span>
                        )}
                    </Button>
                </div>
            </div>

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

                    <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Mon espace */}
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
                                    <i className="pi pi-user text-sm" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-medium leading-snug">
                                        Mon espace
                                    </p>
                                    <p className="text-[11px] text-red-100/80 leading-snug">
                                        Gérer mes informations et préférences
                                    </p>
                                </div>
                            </div>
                            <i className="pi pi-chevron-right text-xs opacity-80" />
                        </button>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {/* Ajouter un vin */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isLoggedIn && protectedPaths.has("/creation-vin")) {
                                        setShowLoginModal(true);
                                    } else {
                                        navigate("/creation-vin");
                                    }
                                    if (op.current) op.current.hide();
                                }}
                                className="
                                    w-full text-left
                                    flex flex-col items-start justify-center
                                    rounded-xl px-3 py-2.5
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10
                                    transition-all duration-200
                                    "
                            >
                                <span className="flex items-center gap-2 text-[12px] font-medium leading-snug">
                                    <i className="pi pi-plus-circle text-xs" />
                                    Ajouter un vin
                                </span>
                                <span className="mt-1 text-[10px] text-red-100/80 leading-snug">
                                    Scanner ou saisir une nouvelle bouteille
                                </span>
                            </button>

                            {/* Dictionnaire */}
                            <button
                                type="button"
                                onClick={() => {
                                    navigate("/dictionnaire");
                                    if (op.current) op.current.hide();
                                }}
                                className="
                                    w-full text-left
                                    flex flex-col items-start justify-center
                                    rounded-xl px-3 py-2.5
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10
                                    transition-all duration-200
                                    "
                            >
                                <span className="flex items-center gap-2 text-[12px] font-medium leading-snug">
                                    <i className="pi pi-book text-xs" />
                                    Dictionnaire
                                </span>
                                <span className="mt-1 text-[10px] text-red-100/80 leading-snug">
                                    Termes, arômes et techniques œnologiques
                                </span>
                            </button>

                            {/* Vos recettes préférées – en dessous, pleine largeur */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        setShowLoginModal(true);
                                    } else {
                                        navigate("/mes-recettes");
                                    }
                                    if (op.current) op.current.hide();
                                }}
                                className="
                                    col-span-2
                                    w-full text-left
                                    flex flex-col items-start justify-center
                                    rounded-xl px-3 py-2.5
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10
                                    transition-all duration-200
                                    "
                            >
                                <span className="flex items-center gap-2 text-[12px] font-medium leading-snug">
                                    <i className="pi pi-heart text-xs" />
                                    Vos recettes préférées
                                </span>
                                <span className="mt-1 text-[10px] text-red-100/80 leading-snug">
                                    Retrouver vos accords mets & vins sauvegardés
                                </span>
                            </button>
                        </div>


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
                                    mt-4
                                    "
                            >
                                <i className="pi pi-sign-out text-sm" />
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
                                    w-full.inline-flex.items-center.justify-center.gap-2
                                    rounded-xl px-4 py-2.5
                                    bg-white/10 hover:bg-white/15
                                    text-white text-sm font-semibold
                                    border border-white/20
                                    transition-all duration-200
                                    mt-4
                                    "
                            >
                                <i className="pi pi-sign-in text-sm" />
                                Se connecter
                            </button>
                        )}
                    </div>
                </div>
            </OverlayPanel>

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

export default BottomBar;
