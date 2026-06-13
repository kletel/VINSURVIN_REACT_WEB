# Changelog — Vitissia Web (vinsurvin.vitissia.fr)

Toutes les modifications notables de l'application web sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).
Le numéro de version correspond à `public/version.txt`, lu par l'app au démarrage
(affiché sur l'écran de connexion et utilisable comme témoin de déploiement).

---

## [1.2.9] — 2026-06-13

### Corrigé
- **Boucle d'appels à `react_isInternalEmail`.** Un re-render ou un effet mal câblé
  (notamment `autoLoginFromStorage` rebranché sur l'event `app-auth-changed`,
  `src/hooks/useAuth.js`) pouvait déclencher des milliers d'appels GET
  `/4DACTION/react_isInternalEmail` en quelques secondes.
  *Incident du 2026-06-13 : ~7 000 requêtes en ~15 s, perçu comme « 20 000 connexions »
  côté serveur 4D, depuis la WebView de l'app (User-Agent `VitissiaApp`).*
  → `src/utils/internalAccess.js` : ajout d'un **cache court (TTL 30 s)** + d'une
  **déduplication des appels concurrents** (`inflight`). Au maximum **1 appel réseau
  par email toutes les 30 s**, quelle que soit la fréquence d'appel côté composant.
- **Boucle pilotée par event.** Les events `subscription:update` et
  `app-subscription-changed` étaient ré-émis à chaque appel, même sans changement de
  valeur. → Désormais ré-émis **uniquement si `isInternal` change**, ce qui casse les
  boucles de type effet ↔ event.

### Modifié
- `src/hooks/useAuth.js` : `login` et `loginMobile` mémoïsés avec `useCallback`
  (dépendances stabilisées) afin d'éviter que l'effet d'auto-login de
  `src/pages/Login.jsx` ne se ré-exécute à chaque rendu.

### Conservé
- Les améliorations de la 1.2.8 sont préservées : fallback local `isInternalEmailValue`
  (domaines internes) et `parseBooleanResponse` tolérant.

### Notes de déploiement
- **Aucune resoumission App Store / Play Store nécessaire.** L'app mobile charge le site
  distant dans une WebView (`VINSURVIN_REACT_APP/.../components/WebContainer.js` →
  `https://vinsurvin.vitissia.fr/`). Un redéploiement du web corrige simultanément
  web, iOS et Android (pas d'OTA Expo, mais aucun code web n'est embarqué dans le binaire).
- Vérifier que `index.html` n'est **pas** sur-mis-en-cache côté serveur (sinon l'ancien
  bundle reste servi). Les fichiers `/static/*` sont hashés → cache-bust automatique.
- **Recommandé** (défense en profondeur, hors périmètre de ce correctif client) :
  ajouter un rate-limit sur `react_isInternalEmail` côté 4D (ex. 5 req / 10 s / session).

### Fichiers touchés
- `src/utils/internalAccess.js`
- `src/hooks/useAuth.js`
- `public/version.txt` (1.2.8 → 1.2.9)

---

## [1.2.8]

Version en production avant le correctif ci-dessus (référence de base).
