import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Wine, BookOpen, Sprout, ChefHat, Leaf, Sun, Moon, Monitor, Search } from "lucide-react";

// Accueil App Vins — avec rubrique "Rechercher un Vin" (appellation → conseils de plats)

export default function AccueilVins() {
  const { theme, setTheme } = useTheme();

  const [q, setQ] = useState(""); // requête d'appellation
  const formRef = useRef(null);

  const statsCave = { bottles: 128, regions: 12, alerts: 3 };

  const tiles = useMemo(
    () => [
      {
        key: "rechercher-vin",
        title: "Rechercher un vin",
        subtitle: "Entrez une appellation et obtenez des idées de plats",
        href: "/recherche",
        icon: Search,
        accentDark: "from-[#7b1733]/70 to-black/70",
        accentLight: "from-[#c62828]/25 to-white/10",
        img: "https://images.unsplash.com/photo-1528821154947-1aa3d1c9d3c1?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Vignoble et grappe de raisin rouge",
        extra: (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              const query = encodeURIComponent(q.trim());
              if (!query) return;
              window.location.href = `/recherche?q=${query}&type=appellation`;
            }}
            className="mt-3 flex w-full items-center gap-2"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex. Bourgogne, Médoc, Sancerre..."
              className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset ring-black/10 bg-white/90 text-neutral-900 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/20 dark:hover:bg-white/15"
            >
              <Search className="h-4 w-4"/> Chercher
            </button>
          </form>
        ),
      },
      {
        key: "ma-cave",
        title: "Ma cave",
        subtitle: "Gérez vos bouteilles, stocks et millésimes",
        href: "/cave",
        icon: Wine,
        accentDark: "from-[#7b1733]/70 to-black/70",
        accentLight: "from-[#a51e41]/30 to-white/10",
        img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Barriques en bois dans une cave à vin",
        extra: (
          <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
            <Badge>🍷 {statsCave.bottles} bouteilles</Badge>
            <Badge>🗺️ {statsCave.regions} régions</Badge>
            <Badge intent="warning">⚠️ {statsCave.alerts} alertes</Badge>
          </div>
        ),
      },
      {
        key: "mets-vin",
        title: "Association mets – vin",
        subtitle: "Trouvez l'accord parfait pour chaque plat",
        href: "/accords",
        icon: ChefHat,
        accentDark: "from-[#a64b2a]/70 to-black/70",
        accentLight: "from-[#d07b4e]/30 to-white/10",
        img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Table en bois avec plats et verre de vin rouge",
      },
      {
        key: "dictionnaire",
        title: "Dictionnaire",
        subtitle: "Glossaire des termes de la vigne et du vin",
        href: "/dictionnaire",
        icon: BookOpen,
        accentDark: "from-[#5e503f]/70 to-black/70",
        accentLight: "from-[#8a7b67]/30 to-white/10",
        img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Livre ouvert sur une table rustique en bois",
      },
      {
        key: "cepages",
        title: "Cépages",
        subtitle: "Explorez les variétés, arômes et terroirs",
        href: "/cepages",
        icon: Sprout,
        accentDark: "from-[#2e7d32]/70 to-black/70",
        accentLight: "from-[#3fa74a]/30 to-white/10",
        img: "https://images.unsplash.com/photo-1505935428862-770b6f24f629?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Grappe de raisin mûre dans un vignoble",
      },
      {
        key: "mes-recettes",
        title: "Mes recettes",
        subtitle: "Sauvegardez vos plats et accords préférés",
        href: "/recettes",
        icon: ChefHat,
        accentDark: "from-[#6d4c41]/70 to-black/70",
        accentLight: "from-[#a07364]/30 to-white/10",
        img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
        alt: "Plan de travail en bois avec ingrédients frais et herbes",
      },
    ],
    [q]
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-white">
      <style>{`
        :root { --ring: rgba(0,0,0,0.08); --brand: #a51e41; }
        html.dark :root { --ring: rgba(255,255,255,0.12); --brand: #7b1733; }
      `}</style>

      <nav className="sticky top-0 z-30 border-b border-black/5 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="font-serif text-xl tracking-tight sm:text-2xl">Bois & Raisin</span>
          </a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1504280390368-3971c1921d95?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3" alt="Vignoble au lever du soleil" className="absolute inset-0 h-full w-full object-cover opacity-60 dark:opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-neutral-50/90 dark:from-black/70 dark:via-black/50 dark:to-neutral-950/90" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Votre univers du <span className="italic text-[color:var(--brand)]">vin</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-3 max-w-2xl text-base text-neutral-700 dark:text-neutral-200 sm:text-lg">
            Bois, raisin, nature : simple, élégant et rapide, pensé pour le smartphone.
          </motion.p>
        </div>
      </header>

      <main className="relative mx-auto -mt-6 max-w-6xl px-4 pb-10 sm:-mt-8">
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, idx) => (
            <motion.a key={tile.key} href={tile.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * idx }} className="group relative isolate overflow-hidden rounded-2xl shadow-xl ring-1 ring-[var(--ring)] focus:outline-none">
              <img src={tile.img} alt={tile.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-b ${tile.accentLight} dark:${tile.accentDark}`} />
              <div className="absolute inset-0 bg-white/5 dark:bg-black/10" />

              <div className="relative z-10 flex min-h-[240px] flex-col justify-start p-0 sm:min-h-[280px]">
                <div className="m-5 rounded-xl bg-white/85 p-5 text-neutral-900 ring-1 ring-black/10 backdrop-blur-sm dark:m-5 dark:bg-black/50 dark:text-white dark:ring-white/15">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-neutral-900 backdrop-blur dark:bg-white/10 dark:text-white">
                      <tile.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">{tile.title}</h2>
                  </div>
                  <p className="mt-2 text-[17px] leading-snug text-neutral-800 sm:text-lg dark:text-neutral-200">{tile.subtitle}</p>
                  {tile.extra}
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <Button>Ouvrir <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Button>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/15 dark:ring-white/25" />
            </motion.a>
          ))}
        </div>
      </main>
    </div>
  );
}

/* --------- Hooks & UI Primitives --------- */
function useTheme() {
  const [theme, setThemeState] = useState("auto");
  useEffect(() => { setThemeState(localStorage.getItem("theme") || "auto"); }, []);
  useEffect(() => {
    const root = document.documentElement;
    const apply = (t) => {
      const isDark = t === "dark" || (t === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", !!isDark);
    };
    apply(theme); localStorage.setItem("theme", theme);
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const addListenerSafely = (type, fn) => { if (mq.addEventListener) mq.addEventListener(type, fn); else if (mq.addListener) mq.addListener(fn); };
    const removeListenerSafely = (type, fn) => { if (mq.removeEventListener) mq.removeEventListener(type, fn); else if (mq.removeListener) mq.removeListener(fn); };
    const listener = () => theme === "auto" && apply("auto");
    addListenerSafely("change", listener);
    return () => removeListenerSafely("change", listener);
  }, [theme]);
  return { theme, setTheme: (t) => setThemeState(t) };
}

function ThemeToggle({ value, onChange }) {
  const options = [
    { key: "light", label: "Clair", Icon: Sun },
    { key: "dark", label: "Sombre", Icon: Moon },
    { key: "auto", label: "Auto", Icon: Monitor },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/20">
      {options.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1 px-3 py-2 text-xs transition ${
              active ? "bg-[color:var(--brand)] text-white" : "bg-white/70 text-neutral-800 hover:bg-white/90 dark:bg-black/30 dark:text-neutral-200 dark:hover:bg-black/40"
            }`}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        );
      })}
    </div>
  );
}

function Badge({ children, intent = "default" }) {
  const intents = {
    default: "bg-black/5 text-neutral-900 ring-black/10 dark:bg-white/10 dark:text-white dark:ring-white/15",
    warning: "bg-amber-400/20 text-amber-900 ring-amber-700/20 dark:bg-yellow-400/20 dark:text-yellow-200 dark:ring-white/15",
    success: "bg-emerald-400/20 text-emerald-900 ring-emerald-700/20 dark:bg-emerald-400/20 dark:text-emerald-200 dark:ring-white/15",
  };
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 ring-1 backdrop-blur ${intents[intent]}`}>{children}</span>;
}

function Button({ children, intent = "primary" }) {
  const styles = {
    primary: "rounded-xl px-4 py-2 ring-1 ring-inset ring-black/10 bg-white/90 text-neutral-900 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/20 dark:hover:bg-white/15",
    ghost: "rounded-xl px-4 py-2 ring-1 ring-inset ring-black/10 text-neutral-900 hover:bg-white/70 dark:ring-white/20 dark:text-neutral-200 dark:hover:bg-white/5",
  };
  return <span className={`inline-flex items-center justify-center text-sm font-medium ${styles[intent]}`}>{children}</span>;
}

function Logo({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#a51e41"/>
          <stop offset="100%" stopColor="#d07b4e"/>
        </linearGradient>
        <linearGradient id="gDark" x1="0" x2="1">
          <stop offset="0%" stopColor="#7b1733"/>
          <stop offset="100%" stopColor="#a64b2a"/>
        </linearGradient>
      </defs>
      <path className="dark:hidden" d="M12 38c12-6 24-6 36 0-6 8-14 12-22 12S14 46 12 38z" fill="url(#g)"/>
      <path className="hidden dark:block" d="M12 38c12-6 24-6 36 0-6 8-14 12-22 12S14 46 12 38z" fill="url(#gDark)"/>
      <circle cx="26" cy="28" r="4" className="fill-[color:var(--brand)]"/>
      <circle cx="34" cy="28" r="4" className="fill-[color:var(--brand)]"/>
      <circle cx="30" cy="34" r="4" className="fill-[color:var(--brand)]"/>
      <rect x="29" y="14" width="2" height="8" rx="1" className="fill-emerald-500 dark:fill-lime-400"/>
    </svg>
  );
}
