import { useState, useEffect } from 'react';
import type { Resident, Interaction, BlessStatus } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export const useResidents = (userId: string | undefined) => {
    const [residents, setResidents] = useState<Resident[]>([]);

    // Load from Supabase on mount or when userId changes
    useEffect(() => {
        if (!userId) {
            setResidents([]);
            return;
        }

        const fetchResidents = async () => {
            const { data, error } = await supabase
                .from('residents')
                .select('*, interactions(*)')
                .eq('profile_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch residents:', error);
                return;
            }

            const formattedResidents: Resident[] = data.map((dbRes: any) => ({
                id: dbRes.id,
                coordinate: dbRes.coordinate,
                address: dbRes.address,
                residentName: dbRes.resident_name,
                currentBlessStatus: dbRes.current_bless_status as BlessStatus,
                prayerRequests: dbRes.prayer_requests,
                interactions: (dbRes.interactions || [])
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((i: any) => ({
                        id: i.id,
                        type: i.type,
                        content: i.content,
                        status: i.status as BlessStatus,
                        timestamp: i.timestamp
                    })),
                lastInteraction: dbRes.last_interaction,
            }));

            setResidents(formattedResidents);
        };
        fetchResidents();
    }, [userId]);

    const addResident = (coordinate: [number, number], address: string) => {
        const newId = uuidv4();
        const interactionId = uuidv4();
        const now = new Date().toISOString();

        const newResident: Resident = {
            id: newId,
            coordinate,
            address,
            residentName: 'New Neighbor',
            currentBlessStatus: 'Prayer',
            interactions: [
                {
                    id: interactionId,
                    type: 'creation',
                    timestamp: now,
                    content: 'Resident added to map',
                    status: 'Prayer'
                }
            ],
            lastInteraction: now,
        };

        // Optimistic update
        setResidents(prev => [newResident, ...prev]);

        // Background update
        if (userId) {
            supabase.from('residents').insert({
                id: newId,
                profile_id: userId,
                coordinate,
                address,
                resident_name: 'New Neighbor',
                current_bless_status: 'Prayer',
                last_interaction: now,
            }).then(({ error: residentError }) => {
                if (residentError) {
                    console.error('Error adding resident:', residentError);
                } else {
                    supabase.from('interactions').insert({
                        id: interactionId,
                        resident_id: newId,
                        type: 'creation',
                        content: 'Resident added to map',
                        status: 'Prayer',
                        timestamp: now,
                    }).then(({ error: interactionError }) => {
                        if (interactionError) console.error('Error adding interaction:', interactionError);
                    });
                }
            });
        }

        return newResident;
    };

    const updateResident = (id: string, updates: Partial<Resident>) => {
        setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

        if (!userId) return;

        const dbUpdates: any = {};
        if (updates.residentName !== undefined) dbUpdates.resident_name = updates.residentName;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.currentBlessStatus !== undefined) dbUpdates.current_bless_status = updates.currentBlessStatus;
        if (updates.prayerRequests !== undefined) dbUpdates.prayer_requests = updates.prayerRequests;

        if (Object.keys(dbUpdates).length > 0) {
            supabase.from('residents').update(dbUpdates).eq('id', id).then(({ error }) => {
                if (error) console.error('Error updating resident:', error);
            });
        }
    };

    const deleteResident = (id: string) => {
        setResidents(prev => prev.filter(r => r.id !== id));

        if (!userId) return;

        supabase.from('residents').delete().eq('id', id).then(({ error }) => {
            if (error) console.error('Error deleting resident:', error);
        });
    };

    const logInteraction = (id: string, type: Interaction['type'], content?: string, newStatus?: BlessStatus) => {
        const interactionId = uuidv4();
        const now = new Date().toISOString();

        const interaction: Interaction = {
            id: interactionId,
            type,
            content,
            status: newStatus,
            timestamp: now,
        };

        setResidents(prev => prev.map(r => {
            if (r.id !== id) return r;

            const updates: Partial<Resident> = {
                interactions: [interaction, ...r.interactions],
                lastInteraction: now,
            };

            if (newStatus) {
                updates.currentBlessStatus = newStatus;
            }

            return { ...r, ...updates };
        }));

        if (!userId) return;

        supabase.from('interactions').insert({
            id: interactionId,
            resident_id: id,
            type,
            content,
            status: newStatus,
            timestamp: now,
        }).then(({ error: interactionError }) => {
            if (interactionError) {
                console.error('Error inserting interaction:', interactionError);
            } else {
                const residentUpdates: any = { last_interaction: now };
                if (newStatus) {
                    residentUpdates.current_bless_status = newStatus;
                }

                supabase.from('residents').update(residentUpdates).eq('id', id).then(({ error: residentError }) => {
                    if (residentError) console.error('Error updating resident last_interaction:', residentError);
                });
            }
        });
    };

    return {
        residents,
        addResident,
        updateResident,
        deleteResident,
        logInteraction,
    };
};
