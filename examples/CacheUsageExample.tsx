
// Exemple d'utilisation du système de cache dans une page

import React from 'react';
import { useCache } from '../hooks/useCache';
import { labsApi } from '../services/firebaseClient';

const ExamplePage: React.FC = () => {
  // Utilisation basique avec cache de 5 minutes
  const { data: labs, isLoading, error, refresh } = useCache(
    'labs-list',
    () => labsApi.getAll(),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );

  // Utilisation avec cache de 10 minutes
  const { data: projects, isLoading: projectsLoading } = useCache(
    'projects-list',
    () => projectsApi.getAll(),
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );

  // Force refresh (bypass cache)
  const handleRefresh = () => {
    refresh(); // Rafraîchit les données en ignorant le cache
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <button onClick={handleRefresh}>Actualiser</button>
      <div>
        {labs?.map(lab => (
          <div key={lab.id}>{lab.name}</div>
        ))}
      </div>
    </div>
  );
};

export default ExamplePage;
