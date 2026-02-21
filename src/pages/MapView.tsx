import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Map } from '../components/Map';
import { Sidebar } from '../components/Sidebar';
import type { Resident } from '../models';

interface MapViewProps {
    residents: Resident[];
    selectedResidentId: string | null;
    setSelectedResidentId: (id: string | null) => void;
    onAddResident: (coord: [number, number]) => void;
    updateResident: (id: string, updates: Partial<Resident>) => void;
    deleteResident: (id: string) => void;
    logInteraction: (id: string, type: any, status?: any, content?: any) => void;
}

export const MapView: React.FC<MapViewProps> = ({
    residents,
    selectedResidentId,
    setSelectedResidentId,
    onAddResident,
    updateResident,
    deleteResident,
    logInteraction
}) => {
    const selectedResident = residents.find(r => r.id === selectedResidentId) || null;

    return (
        <div className="relative w-full h-full bg-gray-50 flex">
            {/* The Map itself */}
            <div className="flex-1 relative h-full w-full">
                <Map
                    residents={residents}
                    onAddResident={onAddResident}
                    onSelectResident={(r) => setSelectedResidentId(r.id)}
                />

                {/* Overlaid sliding sidebar for the selected pin */}
                <AnimatePresence>
                    {selectedResident && (
                        <Sidebar
                            key="sidebar"
                            resident={selectedResident}
                            onClose={() => setSelectedResidentId(null)}
                            onUpdate={updateResident}
                            onDelete={deleteResident}
                            onLogInteraction={logInteraction}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
