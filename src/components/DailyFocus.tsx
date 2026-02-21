import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import type { Resident } from '../models';
import { formatDistanceToNow } from 'date-fns';

interface DailyFocusProps {
    residents: Resident[];
    onSelectResident: (resident: Resident) => void;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ residents, onSelectResident }) => {
    // Logic: Sort by lastInteraction (closest to oldest), take top 5
    const focusList = [...residents]
        .sort((a, b) => new Date(a.lastInteraction).getTime() - new Date(b.lastInteraction).getTime())
        .slice(0, 5);

    if (focusList.length === 0) return null;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden"
            >
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        Daily Focus
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Reconnect with these neighbors</p>
                </div>

                <div className="p-2 space-y-1">
                    <AnimatePresence>
                        {focusList.map(resident => (
                            <motion.button
                                key={resident.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => onSelectResident(resident)}
                                className="w-full text-left p-3 rounded-2xl hover:bg-gray-50 transition-all group flex items-center justify-between border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{resident.residentName}</div>
                                        <div className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(resident.lastInteraction))} ago
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
