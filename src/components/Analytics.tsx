import React from 'react';
import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';
import type { Resident, BlessStatus } from '../models'; // Import BlessStatus type

interface AnalyticsProps {
    residents: Resident[];
}

const BLESS_STEPS: BlessStatus[] = ['Prayer', 'Listen', 'Eat', 'Serve', 'Story'];

export const Analytics: React.FC<AnalyticsProps> = ({ residents }) => {
    const GOAL = 50; // Example goal
    const coverage = Math.min((residents.length / GOAL) * 100, 100);

    // Calculate funnel
    const funnelData = BLESS_STEPS.map(step => ({
        step,
        count: residents.filter(r => r.currentBlessStatus === step).length
    }));

    return (
        <div className="w-full">
            <motion.div
                layout
                className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden"
            >
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Neighborhood Coverage</div>
                            <div className="text-2xl font-black text-gray-900 leading-none mt-1">
                                {Math.round(coverage)}% <span className="text-sm text-gray-400 font-medium">of {GOAL} home goal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 w-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${coverage}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>

                {/* Always expanded in dashboard view */}
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Engagement Funnel
                        </h3>
                        <div className="space-y-4">
                            {funnelData.map((item, idx) => (
                                <div key={item.step} className="flex items-center gap-3 text-sm">
                                    <div className="w-16 font-bold text-gray-600">{item.step}</div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.count / residents.length || 0) * 100}%` }}
                                            className="h-full bg-indigo-500 rounded-full"
                                            transition={{ delay: idx * 0.1 }}
                                        />
                                    </div>
                                    <div className="w-8 text-right font-black text-gray-800">{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-xs font-medium text-center text-gray-500">
                        Top of funnel: <span className="text-indigo-600 font-bold">{funnelData[0]?.count || 0}</span> neighbors in Prayer
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
