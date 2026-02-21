import { useState, useEffect } from 'react';
import type { Resident } from '../models';
import { supabase } from '../lib/supabase';

export const useNotifications = (residents: Resident[], userId: string | undefined) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (!userId) {
            setEnabled(false);
            return;
        }

        const fetchPreference = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('notifications_enabled')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setEnabled(!!data.notifications_enabled);
                // We still want to sync to local storage just in case the check is run before fully hydrating
                localStorage.setItem('bless_notifications_enabled', String(!!data.notifications_enabled));
            } else {
                // Fallback
                const saved = localStorage.getItem('bless_notifications_enabled');
                if (saved) setEnabled(JSON.parse(saved));
            }
        };

        fetchPreference();
    }, [userId]);

    const toggleNotifications = async () => {
        const newValue = !enabled;

        if (newValue) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setEnabled(true);
                localStorage.setItem('bless_notifications_enabled', 'true');
                if (userId) {
                    supabase.from('profiles').update({ notifications_enabled: true }).eq('id', userId)
                        .then(({ error }) => {
                            if (error) console.error('Error updating profile notifications:', error);
                        });
                }
                new Notification('Prayers Activated', {
                    body: "We'll remind you to pray for a neighbor each morning at 8am.",
                });
            }
        } else {
            setEnabled(false);
            localStorage.setItem('bless_notifications_enabled', 'false');
            if (userId) {
                supabase.from('profiles').update({ notifications_enabled: false }).eq('id', userId)
                    .then(({ error }) => {
                        if (error) console.error('Error updating profile notifications:', error);
                    });
            }
        }
    };

    // Check time for notification (Mock implementation for client-side)
    // In a real PWA/app, this would be a Service Worker or Background Sync
    useEffect(() => {
        if (!enabled || residents.length === 0) return;

        const checkTime = () => {
            const now = new Date();
            const lastNotified = localStorage.getItem('bless_last_notification_date');
            const today = now.toDateString();

            if (now.getHours() === 8 && lastNotified !== today) {
                const focusList = [...residents]
                    .sort((a, b) => new Date(a.lastInteraction).getTime() - new Date(b.lastInteraction).getTime())
                    .slice(0, 5);

                const randomResident = focusList[Math.floor(Math.random() * focusList.length)];

                new Notification('Morning Prayer Focus', {
                    body: `Lift up ${randomResident?.residentName || 'your neighbors'} today.`,
                });
                localStorage.setItem('bless_last_notification_date', today);
            }
        };

        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [enabled, residents]);

    return { enabled, toggleNotifications };
};
