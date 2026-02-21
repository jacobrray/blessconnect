import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useResidents } from './hooks/useResidents';
import { useNotifications } from './hooks/useNotifications';
import { reverseGeocode } from './utils/mapbox';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import './index.css';

// Layout and Pages
import { Layout } from './layouts/Layout';
import { Dashboard } from './pages/Dashboard';
import { MapView } from './pages/MapView';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/AuthPage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const { residents, addResident, updateResident, deleteResident, logInteraction } = useResidents(session?.user?.id);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const { enabled: notificationsEnabled, toggleNotifications } = useNotifications(residents, session?.user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddResident = async (coord: [number, number]) => {
    const newResident = addResident(coord, 'Loading address...');
    setSelectedResidentId(newResident.id);

    // Async fetch address
    try {
      const address = await reverseGeocode(coord[0], coord[1]);
      updateResident(newResident.id, { address });
    } catch (e) {
      updateResident(newResident.id, { address: 'Address not found' });
    }
  };

  if (!session) {
    return <AuthPage onAuthSuccess={() => { }} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default Route is Dashboard */}
          <Route index element={
            <Dashboard
              residents={residents}
              onSelectResident={(r) => setSelectedResidentId(r.id)}
            />
          } />

          <Route path="map" element={
            <MapView
              residents={residents}
              selectedResidentId={selectedResidentId}
              setSelectedResidentId={setSelectedResidentId}
              onAddResident={handleAddResident}
              updateResident={updateResident}
              deleteResident={deleteResident}
              logInteraction={logInteraction}
            />
          } />

          <Route path="settings" element={
            <Settings
              notificationsEnabled={notificationsEnabled}
              toggleNotifications={toggleNotifications}
            />
          } />

          {/* Catch all to redirect home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
