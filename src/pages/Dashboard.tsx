import React from 'react';
import { DailyFocus } from '../components/DailyFocus';
import { Analytics } from '../components/Analytics';
import type { Resident } from '../models';

interface DashboardProps {
    residents: Resident[];
    onSelectResident: (resident: Resident) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ residents, onSelectResident }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Your daily BLESS engagement at a glance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                {/* 1. Daily 5 Focus */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        Today's Focus
                    </h2>
                    {/* Re-use the component but we will need to modify it slightly to not be absolute positioned */}
                    <div className="relative w-full h-fit">
                        <DailyFocus residents={residents} onSelectResident={onSelectResident} />
                    </div>
                </section>

                {/* 2. Analytics */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Outreach Temperature</h2>
                    <div className="relative w-full h-fit">
                        <Analytics residents={residents} />
                    </div>
                </section>
            </div>
        </div>
    );
};
