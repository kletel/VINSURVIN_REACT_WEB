import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import config from '../config/config';
import authHeader from '../config/authHeader';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

const MesRecettes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();
  const [recipesMap, setRecipesMap] = useState({});

  const getKey = (rec) =>
    rec?.UUID_Met || rec?.UUID_ || rec?.uuidRecette || rec?.id || `name:${(rec?.nomPlat || rec?.Nom || rec?.Met || '').toLowerCase()}`;

  useEffect(() => {
    const fetchRecettesUtilisateur = async () => {
      try {
        setLoading(true);
        const UUID_User = sessionStorage.getItem('uuid_user');
        if (!UUID_User) throw new Error("Utilisateur non identifié");
        const base = `${config.apiBaseUrl}/4DACTION/react_getRecettesUtilisateur?UUID_user=${encodeURIComponent(UUID_User)}`;
        const [respFav, respSave] = await Promise.all([
          fetch(`${base}&action=favori`, { method: 'GET', headers: authHeader() }),
          fetch(`${base}&action=enregistrer`, { method: 'GET', headers: authHeader() })
        ]);
        if (!respFav.ok && !respSave.ok) throw new Error('Impossible de récupérer vos recettes');
        const [dataFav, dataSave] = await Promise.all([
          respFav.ok ? respFav.json() : Promise.resolve([]),
          respSave.ok ? respSave.json() : Promise.resolve([])
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
              map.set(key, { ...rec, isFavori: type === 'favori', isEnregistrer: type === 'enregistrer' });
            }
          });
        };
        addList(dataFav, 'favori');
        addList(dataSave, 'enregistrer');
        const merged = Array.from(map.values());
        setItems(merged);

        // Récupération ciblée des noms via getRecettes avec champs=UUID_Recette
        const uuids = Array.from(new Set(merged
          .map(r => r?.UUID_Recette || r?.UUID_Met || r?.UUID_ || r?.uuidRecette || r?.uuid)
          .filter(Boolean)));
        if (uuids.length > 0) {
          const valeurs = encodeURIComponent(uuids.join(','));
          const url = `${config.apiBaseUrl}/4DACTION/react_getRecettes?champs=UUID_Recette&valeurs=${valeurs}`;
          const resp = await fetch(url, { method: 'GET', headers: authHeader() });
          if (resp.ok) {
            const data = await resp.json();
            const rMap = {};
            (Array.isArray(data) ? data : []).forEach((rec) => {
              const key = rec?.UUID_Recette || rec?.UUID_ || rec?.uuidRecette || rec?.uuid;
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
        toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.message, life: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchRecettesUtilisateur();
  }, []);

  const getUUIDFromItem = (rec) => rec?.UUID_Recette || rec?.UUID_ || rec?.uuidRecette || rec?.uuid || rec?.UUID_Met || null;
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
    } catch {}
    navigate('/recette');
  };

  const list = useMemo(() => items, [items]);

  return (
    <Layout>
      {/* <Toast ref={toast} />*/}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Mes recettes</h1>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="py-24 text-center text-red-500">{error}</div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center text-gray-500">Aucune recette enregistrée.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((rec, i) => (
              <button
                key={rec.UUID_Met || rec.UUID_ || i}
                onClick={() => openRecette(rec)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow hover:shadow-md transition"
              >
                <div className="aspect-[16/9] bg-gray-100 relative">
                  {rec?.imageBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${rec.imageBase64}`}
                      alt={rec?.nomPlat || rec?.Nom || rec?.Met || 'Recette'}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <i className="pi pi-image text-3xl" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {getNomMetFromItem(rec)}
                  </h3>
                  {rec?.difficulte && (
                    <p className="mt-1 text-sm text-gray-600">Difficulté: {rec.difficulte}</p>
                  )}
                  <div className="mt-3 flex items-center justify-end gap-3 text-gray-500">
                    {rec?.isFavori && (
                      <span className="inline-flex items-center gap-1 text-rose-600" title="Favori">
                        <i className="pi pi-heart" />
                      </span>
                    )}
                    {rec?.isEnregistrer && (
                      <span className="inline-flex items-center gap-1 text-amber-600" title="Enregistré">
                        <i className="pi pi-bookmark" />
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MesRecettes;
