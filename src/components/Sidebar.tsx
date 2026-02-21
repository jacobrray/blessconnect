import React, { useState, useEffect } from 'react';
import type { Resident, BlessStatus } from '../models';
import { X, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface SidebarProps {
    resident: Resident | null;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<Resident>) => void;
    onDelete: (id: string) => void;
    onLogInteraction: (id: string, type: any, content?: string, status?: BlessStatus) => void;
}

const BLESS_STATUSES: BlessStatus[] = ['Prayer', 'Listen', 'Eat', 'Serve', 'Story'];

export const Sidebar: React.FC<SidebarProps> = ({ resident, onClose, onUpdate, onDelete, onLogInteraction }) => {
    const [note, setNote] = useState('');
    const [prayerRequest, setPrayerRequest] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync local state when resident changes
    useEffect(() => {
        if (resident) {
            setPrayerRequest(resident.prayerRequests || '');
        }
    }, [resident]);

    // Debounce save for prayer requests
    useEffect(() => {
        if (!resident) return;
        const timer = setTimeout(() => {
            if (prayerRequest !== resident.prayerRequests) {
                onUpdate(resident.id, { prayerRequests: prayerRequest });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [prayerRequest, resident, onUpdate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (resident && note) {
            onLogInteraction(resident.id, 'note', note);
            setNote('');
        }
    };

    const handleStatusChange = (status: BlessStatus) => {
        if (!resident) return;
        onLogInteraction(resident.id, 'status_change', `Moved to ${status}`, status);
    };

    if (!resident) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 flex flex-col pointer-events-none p-4">
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full bg-white/90 backdrop-blur-2xl shadow-2xl rounded-[32px] border border-white/20 flex flex-col pointer-events-auto overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 pb-4 bg-gradient-to-b from-white/80 to-transparent shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                            <input
                                value={resident.residentName}
                                onChange={(e) => onUpdate(resident.id, { residentName: e.target.value })}
                                className="text-3xl font-bold text-gray-900 tracking-tight bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                                placeholder="Neighbor's Name"
                            />
                            <div className="flex items-center gap-2 text-gray-500 mt-2 w-full">
                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                <input
                                    value={resident.address}
                                    onChange={(e) => onUpdate(resident.id, { address: e.target.value })}
                                    className="text-base font-medium bg-transparent border-none p-0 focus:ring-0 w-full text-gray-500 placeholder:text-gray-300"
                                    placeholder="Address"
                                />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shrink-0"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-2 space-y-8 custom-scrollbar">

                    {/* Status Toggles */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">BLESS Journey</label>
                        <div className="grid grid-cols-5 gap-2">
                            {BLESS_STATUSES.map(s => {
                                const isActive = resident.currentBlessStatus === s;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                            : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'
                                            }`}
                                    >
                                        <div className="text-[10px] font-bold uppercase">{s}</div>
                                        {isActive && <motion.div layoutId="active-dot" className="w-1 h-1 bg-white rounded-full mt-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Persistent Prayer Request */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                            Active Prayer Requests
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto-saving</span>
                        </label>
                        <textarea
                            className="w-full p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl focus:ring-2 focus:ring-yellow-200 focus:bg-yellow-50 focus:outline-none transition-all text-gray-700 leading-relaxed resize-none shadow-inner"
                            placeholder="What are we praying for specifically?"
                            rows={4}
                            value={prayerRequest}
                            onChange={(e) => setPrayerRequest(e.target.value)}
                        />
                    </div>

                    {/* Interaction Log */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interaction Log</label>
                        <form onSubmit={handleSubmit} className="relative group">
                            <input
                                className="w-full pl-5 pr-14 py-4 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:shadow-lg transition-all"
                                placeholder="Log a visit, coffee, or note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!note}
                                className="absolute right-3 top-3 p-1.5 bg-indigo-600 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Timeline */}
                    <div className="pb-8">
                        <div className="space-y-6 relative pl-4 border-l-2 border-dashed border-gray-200 ml-2">
                            {resident.interactions.map((interaction, idx) => (
                                <div key={interaction.id} className="relative pl-8 group">
                                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-300'
                                        }`}></div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {format(new Date(interaction.timestamp), 'MMM d, h:mm a')}
                                            </span>
                                        </div>

                                        <div className={`text-sm text-gray-600 leading-relaxed ${idx === 0 ? 'font-medium text-gray-900' : ''}`}>
                                            {interaction.type === 'status_change' && (
                                                <span className="text-indigo-600 font-semibold">{interaction.content}</span>
                                            )}
                                            {interaction.content && interaction.type !== 'status_change' && (
                                                interaction.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                    {!isDeleting ? (
                        <button
                            onClick={() => setIsDeleting(true)}
                            className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Remove from Visual
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-500">Are you sure?</span>
                            <button
                                onClick={() => {
                                    onDelete(resident.id);
                                    onClose();
                                }}
                                className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all shadow-sm"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setIsDeleting(false)}
                                className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-gray-200 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
};
