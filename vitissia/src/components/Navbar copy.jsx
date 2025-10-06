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

const Navbar = () => {
  const [sidebar, setSidebar] = useState(false);
  const op = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const nomUser = sessionStorage.getItem('nom_user') || '';

  const initials = useMemo(() => nomUser.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join(''), [nomUser]);

  const showSidebar = () => setSidebar(prev => !prev);
  const closeSidebar = () => setSidebar(false);

  // Fermeture via ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeSidebar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActivePath = (path) => location.pathname === path;

  // Liens rapides (desktop) -> ordre explicite demandé
  const quickLinks = useMemo(() => {
    const flat = SidebarData.flatMap(sec => sec.items);
    //const order = ['/cave', '/mets-vins', '/vins-mets', '/dictionnaire', '/repartition-pays'];
    const order = ['/cave', '/mets-vins', '/vins-mets', '/dictionnaire', '/mes-recettes'];
    return order.map(p => flat.find(i => i.path === p)).filter(Boolean);
  }, []);

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        {/* NAVBAR PRINCIPALE */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="relative">
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border-b border-white/40 dark:border-gray-700 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.15)] px-4 md:px-6 py-2.5 flex items-center gap-4">
              {/* Burger + Logo */}
              <div className="flex items-center gap-3 min-w-[140px]">
                {/* Burger supprimé en mobile */}
                <button
                  onClick={showSidebar}
                  aria-label="Basculer le menu"
                  aria-expanded={sidebar}
                  className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow hover:shadow-md transition-all active:scale-95"
                >
                  <FaIcons.FaBars className={`text-lg transition-transform ${sidebar ? 'rotate-90' : ''}`} />
                </button>
                <Link to="/" onClick={closeSidebar} className="group flex items-center gap-2 font-bold text-xl tracking-tight">
                  <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner shadow-emerald-900/30 ring-1 ring-white/30 dark:ring-emerald-400/20">
                    <GiGrapes className="text-2xl drop-shadow" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-emerald-700 to-teal-600 dark:from-emerald-200 dark:via-teal-200 dark:to-white group-hover:opacity-90 transition-opacity">Vitiss.ia</span>
                </Link>
              </div>

              {/* Liens rapides Desktop */}
              <div className="hidden md:flex flex-1 items-center gap-1">
                {quickLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isActivePath(link.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                  >
                    <span className={`absolute inset-0 rounded-lg ${isActivePath(link.path) ? 'bg-emerald-500/10 dark:bg-emerald-400/10 ring-1 ring-emerald-500/30 dark:ring-emerald-400/30' : 'hover:bg-gray-900/5 dark:hover:bg-white/5'} backdrop-blur-sm`}></span>
                    <span className="relative flex items-center gap-2">
                      {link.icon}
                      <span>{link.title}</span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Zone droite */}
              <div className="flex items-center gap-3 ml-auto md:ml-0">
                {/* Bouton collapse sidebar desktop */}
                {/* <button
                  onClick={showSidebar}
                  className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Basculer le menu latéral"
                  aria-pressed={sidebar}
                >
                  <FaIcons.FaBars className={`transition-transform ${sidebar ? 'rotate-90' : ''}`} />
                </button> */}

                {/* Nom utilisateur desktop */}
                <div className="hidden lg:flex flex-col items-end leading-tight">
                  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Connecté</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[160px] truncate">{nomUser}</span>
                </div>

                {/* Avatar / Profil */}
                <Button
                  className="group relative !w-12 !h-12 !p-0 rounded-2xl border-0 shadow-lg shadow-emerald-700/20 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-600 transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                  type="button"
                  onClick={(e) => op.current.toggle(e)}
                  aria-label="Profil utilisateur"
                >
                  {/* Halo et bord dynamique */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40 dark:ring-white/10"></span>

                  {/* Anneau décoratif conique (subtil, visible au survol) */}
                  <span className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute -inset-px rounded-3xl [background:conic-gradient(from_180deg_at_50%_50%,#34d39933,transparent_30%,#14b8a633_60%,transparent_80%,#34d39933)] blur-[6px]"></span>
                  </span>

                  {/* Sheen verre au survol */}
                  <span className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-300/20 via-teal-400/10 to-teal-600/20"></span>

                  {/* Profondeur par ombre interne */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-4px_12px_rgba(0,0,0,0.15)]"></span>

                  {/* Contenu (initiales ou icône) */}
                  <span className="relative z-10 font-bold text-white text-sm tracking-wide flex items-center justify-center drop-shadow">
                     {initials || <GiGrapes className='text-lg drop-shadow' />}
                  </span>

                  {/* Indicateur de statut amélioré */}
                  <span className="pointer-events-none absolute -top-1 -right-1 flex items-center justify-center">
                    <span className="relative flex">
                      <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[6px]"></span>
                      <span className="relative w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 ring-2 ring-white dark:ring-gray-900">
                        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-300/70"></span>
                        <span className="absolute inset-[3px] rounded-full bg-white/70 mix-blend-overlay"></span>
                      </span>
                    </span>
                  </span>

                  {/* Halo focus additionnel */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-focus-visible:ring-2 group-focus-visible:ring-emerald-300/40"></span>
                </Button>
                <OverlayPanel ref={op} className="shadow-2xl border-0 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/90" style={{ width: '300px' }}>
                  <Card nomComplet={nomUser} />
                </OverlayPanel>
              </div>
            </div>
          </div>
        </div>
        {/* Spacer pour contenu */}
        <div className="h-[72px]"></div>

        {/* OVERLAY supprimé pour mobile (sidebar désactivée en mobile) */}
        {/* SIDEBAR visible uniquement >= md */}
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
          <ul className="nav-menu-items px-4 pb-6 overflow-y-auto h-[calc(100%-64px)] custom-scroll" onClick={(e) => { if (e.target.closest('a')) closeSidebar(); }}>
            {SidebarData.map((section, index) => (
              <li key={index} className="mt-6 first:mt-4">
                <h3 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-2 mb-3">{section.section}</h3>
                <ul className="space-y-1">
                  {section.items.map((item, idx) => {
                    const active = isActivePath(item.path);
                    return (
                      <li key={idx}>
                        <Link
                          to={item.path}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${active ? 'text-emerald-300' : 'text-gray-300 hover:text-white'}`}
                        >
                          <span className={`absolute inset-0 rounded-xl ${active ? 'bg-white/10 ring-1 ring-emerald-400/30 backdrop-blur-sm' : 'group-hover:bg-white/5'} transition-colors`}></span>
                          <span className="relative flex items-center gap-3">
                            <span className={`flex items-center justify-center w-9 h-9 rounded-lg border ${active ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-500/30 to-teal-600/30' : 'border-white/10 bg-white/5 group-hover:border-emerald-400/30'} text-lg text-emerald-300 group-hover:scale-105 transition-transform`}>{item.icon}</span>
                            <span className="relative spanNav truncate max-w-[140px]">{item.title}</span>
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
    </>
  );
};

export default Navbar;
