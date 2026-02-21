import React from 'react';
import { Bell, Settings as SettingsIcon, Info, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsProps {
    notificationsEnabled: boolean;
    toggleNotifications: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ notificationsEnabled, toggleNotifications }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 p-4 md:p-8 overflow-y-auto">
            <header className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-indigo-500" />
                    Settings
                </h1>
                <p className="text-gray-500 mt-2">Manage your BLESS app preferences.</p>
            </header>

            <section className="bg-white rounded-3xl premium-glass p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Liturgical Reminders
                </h2>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900">Morning Prayer Push</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Receive a daily notification at 8:00 AM reminding you to pray for a specific neighbor from your focus list.
                        </p>
                    </div>

                    <button
                        onClick={toggleNotifications}
                        className={`
                            relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                            ${notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200'}
                        `}
                        role="switch"
                        aria-checked={notificationsEnabled}
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 
                                transition duration-200 ease-in-out
                                ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mt-6">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                        These notifications use your browser's Web Push API. You must allow notifications when your browser prompts you for this feature to work.
                    </p>
                </div>
            </section>

            <section className="mt-8 bg-white rounded-3xl premium-glass p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    Account Actions
                </h2>

                <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </section>
        </div>
    );
};
